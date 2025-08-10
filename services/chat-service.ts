import { InferenceClient } from "@huggingface/inference";
import { Pinecone } from "@pinecone-database/pinecone";
import { ChatMessage, FunctionCall } from "../types";
import { logger } from "@/utils/logger";
import { EmailService } from "./email-service";

interface RAGConfig {
  minScore: number;
  maxChunks: number;
  minChunks: number;
  scoreThreshold: number;
  maxTokens?: number;
}

interface RelevantChunk {
  text: string;
  score: number;
  chunkIndex: number;
  tokenCount?: number;
}

interface RAGQueryResult {
  question: string;
  answer: string;
  sources: Array<{
    score: number;
    preview: string;
  }>;
}


export class ChatService {
  private client: InferenceClient;
  private emailService: EmailService;
  private pinecone: Pinecone;
  private index: ReturnType<Pinecone["index"]>;
  private indexName: string = "portfolio-knowledge-base";
  private embeddingModel: string = "sentence-transformers/all-MiniLM-L6-v2";

  private ragConfig: RAGConfig = {
    minScore: 0.3,
    maxChunks: 10,
    minChunks: 1,
    scoreThreshold: 0.7,
    maxTokens: 4000,
  };

  constructor(token: string) {
    this.client = new InferenceClient(token);
    this.emailService = new EmailService();

    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    this.index = this.pinecone.index(this.indexName);
    logger.info("ChatService with RAG initialized");
  }

  
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.client.featureExtraction({
        model: this.embeddingModel,
        inputs: text,
      });

      if (Array.isArray(response)) {
        if (Array.isArray(response[0])) {
          return response[0] as number[];
        }
        return response as number[];
      }

      if (typeof response === "number") {
        return [response];
      }

      return Array.from(response as ArrayLike<number>);
    } catch (error) {
      logger.error("Error generating embedding", error);
      throw error;
    }
  }

  
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  
  private async searchRelevantChunks(
    query: string,
    topK: number = 3
  ): Promise<RelevantChunk[]> {
    try {
      logger.debug(`Searching for: "${query}"`);

      const queryEmbedding = await this.generateEmbedding(query);

      const searchResponse = await this.index.query({
        vector: queryEmbedding,
        topK: topK,
        includeMetadata: true,
      });

      const matches =
        (
          searchResponse as unknown as {
            matches?: Array<{
              metadata?: { text?: string; chunk_index?: number };
              score?: number;
            }>;
          }
        ).matches ?? [];

      const relevantChunks: RelevantChunk[] = matches.map((match) => ({
        text: match.metadata?.text ?? "",
        score: match.score ?? 0,
        chunkIndex: match.metadata?.chunk_index ?? 0,
      }));

      logger.info(`Found ${relevantChunks.length} relevant chunks`);
      return relevantChunks;
    } catch (error) {
      logger.error("Error searching relevant chunks", error);
      throw error;
    }
  }

  
  private async searchRelevantChunksWithDynamicFiltering(
    query: string
  ): Promise<RelevantChunk[]> {
    try {
      logger.debug(`Searching for: "${query}"`);

      const queryEmbedding = await this.generateEmbedding(query);

      const searchResponse = await this.index.query({
        vector: queryEmbedding,
        topK: this.ragConfig.maxChunks,
        includeMetadata: true,
      });

      const matches =
        (
          searchResponse as unknown as {
            matches?: Array<{
              metadata?: { text?: string; chunk_index?: number };
              score?: number;
            }>;
          }
        ).matches ?? [];

      const allChunks: RelevantChunk[] = matches.map((match) => ({
        text: match.metadata?.text ?? "",
        score: match.score ?? 0,
        chunkIndex: match.metadata?.chunk_index ?? 0,
        tokenCount: this.estimateTokens(match.metadata?.text ?? ""),
      }));

      const relevantChunks = this.applyDynamicFiltering(allChunks);

      logger.info(
        `Found ${relevantChunks.length} relevant chunks after dynamic filtering`,
        {
          totalCandidates: allChunks.length,
          averageScore:
            relevantChunks.length > 0
              ? relevantChunks.reduce((sum, chunk) => sum + chunk.score, 0) /
                relevantChunks.length
              : 0,
          scoreRange:
            relevantChunks.length > 0
              ? {
                  min: Math.min(...relevantChunks.map((c) => c.score)),
                  max: Math.max(...relevantChunks.map((c) => c.score)),
                }
              : { min: 0, max: 0 },
        }
      );

      return relevantChunks;
    } catch (error) {
      logger.error(
        "Error searching relevant chunks with dynamic filtering",
        error
      );
      throw error;
    }
  }

  
  private applyDynamicFiltering(chunks: RelevantChunk[]): RelevantChunk[] {
    const minScoreFiltered = chunks.filter(
      (chunk) => chunk.score >= this.ragConfig.minScore
    );

    if (minScoreFiltered.length === 0) {
      logger.warn("No chunks meet minimum score requirement", {
        minScore: this.ragConfig.minScore,
        bestScore: chunks[0]?.score || 0,
      });
      return chunks.slice(0, 1);
    }

    const highQualityChunks = minScoreFiltered.filter(
      (chunk) => chunk.score >= this.ragConfig.scoreThreshold
    );

    let selectedChunks: RelevantChunk[] = [];

    if (highQualityChunks.length >= 3) {
      selectedChunks = highQualityChunks.slice(0, 5);
      logger.debug("Using high-quality chunks strategy", {
        count: selectedChunks.length,
      });
    } else {
      selectedChunks = this.selectChunksByScoreGap(minScoreFiltered);
    }

    if (this.ragConfig.maxTokens) {
      selectedChunks = this.limitByTokens(selectedChunks);
    }

    const minChunksToUse = Math.min(
      this.ragConfig.minChunks,
      selectedChunks.length
    );
    const finalChunks = Math.max(selectedChunks.length, minChunksToUse);
    return selectedChunks.slice(0, finalChunks);
  }

  
  private selectChunksByScoreGap(chunks: RelevantChunk[]): RelevantChunk[] {
    if (chunks.length <= 2) return chunks;

    const selected = [chunks[0]];
    const gapThreshold = 0.1;

    for (let i = 1; i < chunks.length && i < this.ragConfig.maxChunks; i++) {
      const currentScore = chunks[i].score;
      const previousScore = chunks[i - 1].score;
      const scoreGap = previousScore - currentScore;

      if (
        scoreGap > gapThreshold &&
        selected.length >= this.ragConfig.minChunks
      ) {
        logger.debug("Score gap detected, stopping chunk selection", {
          scoreGap,
          currentScore,
          previousScore,
          selectedCount: selected.length,
        });
        break;
      }

      selected.push(chunks[i]);
    }

    return selected;
  }

  
  private limitByTokens(chunks: RelevantChunk[]): RelevantChunk[] {
    if (!this.ragConfig.maxTokens) return chunks;

    const selected: RelevantChunk[] = [];
    let totalTokens = 0;

    for (const chunk of chunks) {
      const chunkTokens = chunk.tokenCount || this.estimateTokens(chunk.text);

      if (totalTokens + chunkTokens <= this.ragConfig.maxTokens) {
        selected.push(chunk);
        totalTokens += chunkTokens;
      } else if (selected.length === 0) {
        selected.push(chunk);
        break;
      } else {
        logger.debug("Token limit reached, stopping chunk selection", {
          totalTokens,
          limit: this.ragConfig.maxTokens,
          selectedCount: selected.length,
        });
        break;
      }
    }

    return selected;
  }

  private async generateKnowledgeBaseFromRAG(query: string): Promise<string> {
    try {
      const relevantChunks =
        await this.searchRelevantChunksWithDynamicFiltering(query);

      if (relevantChunks.length === 0) {
        logger.warn("No relevant chunks found for query", { query });
        return "Aucune information pertinente trouvée dans la base de connaissances.";
      }

      const knowledgeBase = relevantChunks
        .map((chunk, index) => {
          const qualityLabel =
            chunk.score >= this.ragConfig.scoreThreshold
              ? "📌 TRÈS PERTINENT"
              : chunk.score >= 0.5
                ? "✓ PERTINENT"
                : "○ RÉFÉRENCE";

          return `## Source ${index + 1} - ${qualityLabel} (Score: ${chunk.score.toFixed(3)})\n${chunk.text}`;
        })
        .join("\n\n");

      const totalTokens = relevantChunks.reduce(
        (sum, chunk) => sum + (chunk.tokenCount || 0),
        0
      );

      logger.info("Generated dynamic knowledge base from RAG", {
        chunksCount: relevantChunks.length,
        knowledgeBaseLength: knowledgeBase.length,
        estimatedTokens: totalTokens,
        averageScore:
          relevantChunks.length > 0
            ? relevantChunks.reduce((sum, chunk) => sum + chunk.score, 0) /
              relevantChunks.length
            : 0,
        qualityDistribution: {
          highQuality: relevantChunks.filter(
            (c) => c.score >= this.ragConfig.scoreThreshold
          ).length,
          mediumQuality: relevantChunks.filter(
            (c) => c.score >= 0.5 && c.score < this.ragConfig.scoreThreshold
          ).length,
          lowQuality: relevantChunks.filter((c) => c.score < 0.5).length,
        },
      });

      return knowledgeBase;
    } catch (error) {
      logger.error(
        "Error generating knowledge base from RAG with dynamic filtering",
        error
      );
      return "Erreur lors de la récupération des informations depuis la base de connaissances.";
    }
  }

  createSecureSystemPrompt(
    knowledgeBase: string,
    targetLanguage: "en" | "fr"
  ): string {
    logger.debug("Creating system prompt", {
      knowledgeBaseLength: knowledgeBase.length,
    });

    return `# ASSISTANT MARCO PYRÉ - OPTIMISÉ POUR GEMMA 3 27B IT

Tu es un assistant spécialisé pour présenter Marco Pyré, développeur fullstack.

## CONTEXTE PRINCIPAL
${knowledgeBase}

Tu es développé via Hugging Face, alimenté par un système RAG avec Pinecone, avec un backend API NextJS hébergé chez Vercel et un frontend NextJS sur GitHub Pages.

## RÈGLES DE DÉCLENCHEMENT DE FONCTIONS - PRIORITÉ ABSOLUE

**ATTENTION : LES FONCTIONS NE DOIVENT ÊTRE DÉCLENCHÉES QUE SUR DEMANDE EXPLICITE**

### CONDITIONS STRICTES POUR DÉCLENCHER UNE FONCTION :
1. L'utilisateur DOIT utiliser un verbe d'action impératif ("télécharge", "envoie", "ouvre", "montre")
2. OU confirmer explicitement ("oui", "d'accord", "s'il vous plaît", "je veux")
3. OU demander directement une action ("peux-tu télécharger", "pourrais-tu envoyer")

### NE JAMAIS DÉCLENCHER POUR :
- Questions informatives ("comment", "qu'est-ce que", "parlez-moi de")
- Mentions indirectes ("j'aimerais savoir", "je suis intéressé")
- Expressions de curiosité ("c'est intéressant", "ça m'intrigue")

### STRATÉGIE DE RÉPONSE EN 2 ÉTAPES :
1. **PREMIÈRE ÉTAPE** : Toujours répondre à la question avec les informations disponibles
2. **DEUXIÈME ÉTAPE** : Proposer l'action pertinente SANS la déclencher

## FONCTIONS DISPONIBLES

### get_resume
- **Déclenche SEULEMENT si** : demande explicite de téléchargement du CV
- **Format** : [FUNCTION_CALL] get_resume: {} [/FUNCTION_CALL]

### send_contact_email  
- **Déclenche SEULEMENT si** : demande explicite d'envoi d'email
- **Format** : [FUNCTION_CALL] send_contact_email: {} [/FUNCTION_CALL]

### get_link
- **Déclenche SEULEMENT si** : demande explicite d'ouverture de lien
- **Format** : [FUNCTION_CALL] get_link: {"url": "URL_EXACTE"} [/FUNCTION_CALL]
- **Liens disponibles** :
  - Portfolio GitHub : "https://github.com/marcopyre/portfolio"  
  - Site ostea38 : "https://ostea38.fr"

## EXEMPLES DE RÉPONSES CORRECTES

### Question sur l'architecture (NE PAS envoyer d'image) :
**Utilisateur** : "Comment est structuré le portfolio ?"
**Réponse** : "Le portfolio utilise une architecture moderne avec un backend API NextJS hébergé chez Vercel et un frontend NextJS sur GitHub Pages, alimenté par un système RAG via Hugging Face et Pinecone. Je peux vous montrer le schéma d'architecture si vous le souhaitez."

### Demande visuelle explicite (ENVOYER l'image) :
**Utilisateur** : "Montre-moi le schéma d'architecture"
**Réponse** : "Voici le schéma d'architecture du portfolio :
[IMAGE] 1k8GsIhF6HFerkYPR33f0e9g0vFfyCr4Q [/IMAGE]"

### Question informative fonction (NE PAS déclencher) :
**Utilisateur** : "Comment puis-je contacter Marco ?"
**Réponse** : "Marco peut être contacté à ytmarcopyre@gmail.com. Je peux également ouvrir votre client email avec un message pré-rédigé si vous le souhaitez."

### Demande explicite fonction (DÉCLENCHER) :
**Utilisateur** : "Envoie-moi un email de contact s'il te plaît"
**Réponse** : "Je vais ouvrir votre client email avec un message pour Marco.
[FUNCTION_CALL] send_contact_email: {} [/FUNCTION_CALL]"

## RÈGLES D'ENVOI D'IMAGES - CONTRÔLE STRICT

**ATTENTION : LES IMAGES NE DOIVENT ÊTRE ENVOYÉES QUE SUR DEMANDE EXPLICITE**

### CONDITIONS STRICTES POUR ENVOYER UNE IMAGE :
1. L'utilisateur DOIT demander explicitement à voir un schéma/diagramme ("montre-moi le schéma", "peux-tu afficher l'architecture")
2. OU utiliser des termes visuels ("voir", "visualiser", "diagramme", "schéma", "architecture")
3. OU confirmer après proposition ("oui, montre-moi", "d'accord pour l'image")

### NE JAMAIS ENVOYER D'IMAGE POUR :
- Questions générales sur l'architecture (expliquer avec du texte)
- Mentions indirectes de projets ou technologies
- Conversations normales sans demande visuelle explicite

### IMAGES DISPONIBLES :
- 1k8GsIhF6HFerkYPR33f0e9g0vFfyCr4Q : Schéma architecture du portfolio
- 1NFlRRtgvxf76hKmQRyt_IqL_3MkNJ803 : Schéma architecture du projet ostea38

### STRATÉGIE DE RÉPONSE POUR LES IMAGES :
1. **PREMIÈRE ÉTAPE** : Répondre avec du texte descriptif
2. **DEUXIÈME ÉTAPE** : Proposer de montrer le schéma SANS l'envoyer
3. **TROISIÈME ÉTAPE** : Envoyer seulement si demande explicite

**Format image** : [IMAGE] nom_de_l_image [/IMAGE]
- Ne jamais renvoyer la même image dans une conversation

## LANGUE / LANGUAGE
- Réponds STRICTEMENT dans la langue du dernier message utilisateur: ${
      targetLanguage === "fr" ? "Français" : "Anglais"
    }.
- Always answer STRICTLY in the language of the user's last message: ${
      targetLanguage === "fr" ? "French" : "English"
    }.
- If the user's message changes language during the conversation, switch accordingly.

## INSTRUCTIONS GÉNÉRALES
- Utiliser uniquement les informations du contexte verrouillé généré par le système RAG
- Rester professionnel mais accessible
- Formater en Markdown avec des emojis appropriés
- Mettre en avant l'expertise cloud native et fullstack
- Si information manquante, diriger vers ytmarcopyre@gmail.com
- Valoriser l'expérience en alternance et la recherche post-études

## PRIORITÉS D'EXÉCUTION
1. **PRIORITÉ 1** : Contrôler strictement les déclenchements de fonctions
2. **PRIORITÉ 2** : Contrôler strictement l'envoi d'images  
3. **PRIORITÉ 3** : Répondre avec les informations pertinentes du système RAG
4. **PRIORITÉ 4** : Proposer des actions sans les déclencher
`;
  }

  async parseResponseForFunctions(
    response: string
  ): Promise<FunctionCall | null> {
    logger.debug("Parsing response for functions", {
      responseLength: response.length,
    });

    const functionRegex =
      /\[FUNCTION_CALL\]\s*(\w+):\s*({.*?}|\{\})\s*\[\/FUNCTION_CALL\]/s;
    const match = response.match(functionRegex);

    if (match) {
      const functionName = match[1];
      let parameters = {};

      try {
        parameters = JSON.parse(match[2]);
        logger.info("Function call detected", {
          functionName,
          parameters,
        });
      } catch (error) {
        logger.error("Error parsing function parameters", {
          functionName,
          rawParameters: match[2],
          error,
        });
      }

      return {
        name: functionName,
        parameters,
      };
    }

    logger.debug("No function call found in response");
    return null;
  }

  extractImagesFromResponse(response: string): string[] {
    const imageBlocks = Array.from(
      response.matchAll(/\[IMAGE\](.*?)\[\/IMAGE\]/gs)
    );
    return imageBlocks.map((match) => {
      const val = match[1].trim();
      if (val.startsWith("http")) return val;
      return `https://drive.google.com/thumbnail?id=${val}&sz=w1000`;
    });
  }

  private convertMessagesToHuggingFaceFormat(
    messages: ChatMessage[],
    systemPrompt: string
  ) {
    const convertedMessages = [];

    let systemPromptAdded = false;

    for (const msg of messages) {
      if (msg.role === "user" && !systemPromptAdded) {
        convertedMessages.push({
          role: "user" as const,
          content: `${systemPrompt}\n\n---\n\nUser: ${msg.content}`,
        });
        systemPromptAdded = true;
      } else {
        convertedMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    return convertedMessages;
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    logger.info("Generating chat response with RAG", {
      messageCount: messages.length,
    });

    try {
      const lastUserMessage =
        messages.filter((m) => m.role === "user").pop()?.content || "";

      const dynamicKnowledgeBase =
        await this.generateKnowledgeBaseFromRAG(lastUserMessage);

      const isEnglish =
        /[A-Za-z]/.test(lastUserMessage) &&
        !/[àâçéèêëîïôûùüÿñæœ]/i.test(lastUserMessage);
      const targetLanguage: "en" | "fr" = isEnglish ? "en" : "fr";

      const systemPrompt = this.createSecureSystemPrompt(
        dynamicKnowledgeBase,
        targetLanguage
      );

      const messagesWithSystem = this.convertMessagesToHuggingFaceFormat(
        messages,
        systemPrompt
      );

      const chatCompletion = await this.client.chatCompletion({
        model: "google/gemma-3-27b-it",
        messages: messagesWithSystem,
        temperature: 1.0,
        top_k: 64,
        top_p: 0.95,
      });

      const response =
        chatCompletion.choices[0]?.message?.content ||
        "Désolé, je n'ai pas pu générer de réponse appropriée.";

      logger.info("Chat response generated successfully with RAG", {
        responseLength: response.length,
        ragChunksUsed: dynamicKnowledgeBase.split("## Source").length - 1,
      });

      this.emailService
        .sendConversationLog(
          lastUserMessage,
          response,
          new Date().toISOString()
        )
        .catch((error) => {
          logger.error("Failed to send conversation log", error);
        });

      return response;
    } catch (error) {
      logger.error("Error generating chat response with RAG", error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const isTokenError =
        errorMessage.includes("quota") ||
        errorMessage.includes("rate limit") ||
        errorMessage.includes("insufficient") ||
        errorMessage.includes("credits") ||
        errorMessage.includes("payment") ||
        errorMessage.includes("billing");

      if (isTokenError) {
        logger.warn("Hugging Face token/credits error detected", {
          error: errorMessage,
        });

        try {
          await this.emailService.sendTokenExpiredNotification();
        } catch (emailError) {
          logger.error("Failed to send token expired notification", emailError);
        }

        return "Je suis à court de token, une notification a été envoyé à Marco, le soucis seras corrigé d'ici peu.";
      }

      try {
        await this.emailService.sendErrorNotification(
          error instanceof Error ? error : new Error(String(error)),
          "Chat response generation with RAG"
        );
      } catch (emailError) {
        logger.error("Failed to send error notification", emailError);
      }

      throw error;
    }
  }

  public updateRAGConfig(config: Partial<RAGConfig>): void {
    this.ragConfig = { ...this.ragConfig, ...config };
    logger.info("RAG configuration updated", { newConfig: this.ragConfig });
  }

  async analyzeQueryQuality(query: string): Promise<{
    totalCandidates: number;
    relevantChunks: number;
    averageScore: number;
    recommendedChunks: number;
    qualityDistribution: Record<string, number>;
  }> {
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      const searchResponse = await this.index.query({
        vector: queryEmbedding,
        topK: this.ragConfig.maxChunks,
        includeMetadata: true,
      });

      const matches =
        (
          searchResponse as unknown as {
            matches?: Array<{
              metadata?: { text?: string; chunk_index?: number };
              score?: number;
            }>;
          }
        ).matches ?? [];

      const allChunks = matches.map((match) => match.score ?? 0);
      const relevantChunks = allChunks.filter(
        (score: number) => score >= this.ragConfig.minScore
      );

      const processedChunks = matches.map((match) => ({
        text: match.metadata?.text ?? "",
        score: match.score ?? 0,
        chunkIndex: match.metadata?.chunk_index ?? 0,
        tokenCount: this.estimateTokens(match.metadata?.text ?? ""),
      }));

      const recommendedChunks = this.applyDynamicFiltering(processedChunks);

      return {
        totalCandidates: allChunks.length,
        relevantChunks: relevantChunks.length,
        averageScore:
          relevantChunks.length > 0
            ? relevantChunks.reduce(
                (sum: number, score: number) => sum + score,
                0
              ) / relevantChunks.length
            : 0,
        recommendedChunks: recommendedChunks.length,
        qualityDistribution: {
          high: allChunks.filter(
            (score: number) => score >= this.ragConfig.scoreThreshold
          ).length,
          medium: allChunks.filter(
            (score: number) =>
              score >= 0.5 && score < this.ragConfig.scoreThreshold
          ).length,
          low: allChunks.filter(
            (score: number) => score < 0.5 && score >= this.ragConfig.minScore
          ).length,
          veryLow: allChunks.filter(
            (score: number) => score < this.ragConfig.minScore
          ).length,
        },
      };
    } catch (error) {
      logger.error("Error analyzing query quality", error);
      throw error;
    }
  }

  async testRAGQuery(query: string): Promise<RAGQueryResult> {
    try {
      const relevantChunks =
        await this.searchRelevantChunksWithDynamicFiltering(query);
      const knowledgeBase = await this.generateKnowledgeBaseFromRAG(query);

      return {
        question: query,
        answer: knowledgeBase,
        sources: relevantChunks.map((chunk) => ({
          score: chunk.score,
          preview: chunk.text.substring(0, 100) + "...",
        })),
      };
    } catch (error) {
      logger.error("Error testing RAG query", error);
      throw error;
    }
  }

  async getIndexStats() {
    try {
      const stats = await this.index.describeIndexStats();
      return stats;
    } catch (error) {
      logger.error("Error getting index stats", error);
      return null;
    }
  }
}