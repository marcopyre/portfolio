import { InferenceClient } from "@huggingface/inference";
import { Pinecone } from "@pinecone-database/pinecone";
import { franc } from "franc";
import {
  ChatMessage,
  FunctionCall,
  RAGConfig,
  RAGQueryResult,
  RelevantChunk,
} from "../types";
import { logger } from "@/utils/logger";
import { EmailService } from "./email-service";

export class ChatService {
  private client: InferenceClient;
  private emailService: EmailService;
  private pinecone: Pinecone;
  private index: any;
  private indexName: string = "portfolio-knowledge-base";
  private embeddingModel: string =
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2";

  private ragConfig: RAGConfig = {
    minScore: 0.2,
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

  private detectUserLanguage(text: string): string {
    try {
      const langCode = franc(text);
      logger.debug("Language detected", { text: text.slice(0, 50), langCode });
      return langCode === "fra" ? "fr" : "en";
    } catch (error) {
      logger.warn("Language detection failed, defaulting to English", error);
      return "en";
    }
  }

  private async translateToEnglish(text: string): Promise<string> {
    const detectedLang = this.detectUserLanguage(text);

    if (detectedLang === "en") return text;

    try {
      const res: any = await (this.client as any).translation({
        model: "facebook/nllb-200-distilled-600M",
        inputs: text,
        source_language: "fra_Latn",
        target_language: "eng_Latn",
      });

      const result = Array.isArray(res) ? res[0] : res;
      return result?.translation_text || text;
    } catch (error) {
      logger.warn("Translation failed, using original text", error);
      return text;
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.client.featureExtraction({
        model: this.embeddingModel,
        inputs: text,
      });

      if (Array.isArray(response)) {
        return Array.isArray(response[0])
          ? (response[0] as number[])
          : (response as number[]);
      }
      return typeof response === "number"
        ? [response]
        : Array.from(response as ArrayLike<number>);
    } catch (error) {
      logger.error("Error generating embedding", error);
      throw error;
    }
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private async detectQueryCategory(query: string): Promise<string | null> {
    const queryEn = await this.translateToEnglish(query);
    const categories = [
      "projects",
      "experience",
      "skills",
      "education",
      "certifications",
      "achievements",
    ];

    for (const category of categories) {
      if (new RegExp(`\\b${category}\\b`, "i").test(queryEn)) {
        return category;
      }
    }
    return null;
  }

  private async searchRelevantChunks(query: string): Promise<RelevantChunk[]> {
    try {
      const targetCategory = await this.detectQueryCategory(query);
      const queryEn = await this.translateToEnglish(query);
      const queryEmbedding = await this.generateEmbedding(queryEn);

      const searchResponse = await this.index.query({
        vector: queryEmbedding,
        topK: this.ragConfig.maxChunks,
        includeMetadata: true,
        filter: targetCategory
          ? { category: { $eq: targetCategory } }
          : undefined,
      });

      const matches = searchResponse?.matches || [];
      let chunks: RelevantChunk[] = matches.map((match: any) => {
        const metadata = match?.metadata || {};
        return {
          text: metadata.text || metadata.content || "",
          score: match.score,
          chunkIndex: metadata.chunk_index || metadata.chunkIndex || -1,
          tokenCount: this.estimateTokens(
            metadata.text || metadata.content || ""
          ),
          category: metadata.category,
          type: metadata.type,
          name: metadata.name,
        };
      });

      if (chunks.length === 0 && targetCategory) {
        const fallbackResponse = await this.index.query({
          vector: queryEmbedding,
          topK: this.ragConfig.maxChunks,
          includeMetadata: true,
        });

        chunks = (fallbackResponse?.matches || []).map((match: any) => {
          const metadata = match?.metadata || {};
          return {
            text: metadata.text || metadata.content || "",
            score: match.score,
            chunkIndex: metadata.chunk_index || metadata.chunkIndex || -1,
            tokenCount: this.estimateTokens(
              metadata.text || metadata.content || ""
            ),
            category: metadata.category,
            type: metadata.type,
            name: metadata.name,
          };
        });
      }

      if (targetCategory && chunks.length > 0) {
        chunks.sort((a, b) => {
          const aBoost = a.category === targetCategory ? 1 : 0;
          const bBoost = b.category === targetCategory ? 1 : 0;
          return aBoost !== bBoost ? bBoost - aBoost : b.score - a.score;
        });
      }

      return this.applyDynamicFiltering(chunks);
    } catch (error) {
      logger.error("Error searching relevant chunks", error);
      throw error;
    }
  }

  private applyDynamicFiltering(chunks: RelevantChunk[]): RelevantChunk[] {
    const minScoreFiltered = chunks.filter(
      (chunk) => chunk.score >= this.ragConfig.minScore
    );

    if (minScoreFiltered.length === 0) {
      return chunks.slice(0, 1);
    }

    const highQualityChunks = minScoreFiltered.filter(
      (chunk) => chunk.score >= this.ragConfig.scoreThreshold
    );
    let selectedChunks =
      highQualityChunks.length >= 3
        ? highQualityChunks.slice(0, 5)
        : this.selectChunksByScoreGap(minScoreFiltered);

    if (this.ragConfig.maxTokens) {
      selectedChunks = this.limitByTokens(selectedChunks);
    }

    return selectedChunks.slice(
      0,
      Math.max(selectedChunks.length, this.ragConfig.minChunks)
    );
  }

  private selectChunksByScoreGap(chunks: RelevantChunk[]): RelevantChunk[] {
    if (chunks.length <= 2) return chunks;

    const selected = [chunks[0]];
    const gapThreshold = 0.1;

    for (let i = 1; i < chunks.length && i < this.ragConfig.maxChunks; i++) {
      const scoreGap = chunks[i - 1].score - chunks[i].score;

      if (
        scoreGap > gapThreshold &&
        selected.length >= this.ragConfig.minChunks
      ) {
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
        break;
      }
    }

    return selected;
  }

  private async generateKnowledgeBase(query: string): Promise<string> {
    try {
      const relevantChunks = await this.searchRelevantChunks(query);

      if (relevantChunks.length === 0) {
        return "No relevant information found in the knowledge base.";
      }

      return relevantChunks
        .map((chunk, index) => {
          const qualityLabel =
            chunk.score >= this.ragConfig.scoreThreshold
              ? "📌 HIGHLY RELEVANT"
              : chunk.score >= 0.5
                ? "✓ RELEVANT"
                : "○ REFERENCE";

          return `## Source ${index + 1} - ${qualityLabel} (Score: ${chunk.score.toFixed(3)})\n${chunk.text}`;
        })
        .join("\n\n");
    } catch (error) {
      logger.error("Error generating knowledge base", error);
      return "Error retrieving information from the knowledge base.";
    }
  }

  createSecureSystemPrompt(
    knowledgeBase: string,
    userLanguage: string
  ): string {
    logger.debug("Creating system prompt", {
      knowledgeBaseLength: knowledgeBase.length,
      userLanguage,
    });

    const basePrompt = `# MARCO PYRÉ ASSISTANT - OPTIMIZED FOR GEMMA 3 27B IT

You are a specialized assistant to present Marco Pyré, fullstack developer.

## MAIN CONTEXT
${knowledgeBase}

You are developed via Hugging Face, powered by a RAG system with Pinecone, with a NextJS API backend hosted on Vercel and a NextJS frontend on GitHub Pages.

## FUNCTION TRIGGERING RULES - ABSOLUTE PRIORITY

**ATTENTION: FUNCTIONS SHOULD ONLY BE TRIGGERED ON EXPLICIT REQUEST**

### STRICT CONDITIONS TO TRIGGER A FUNCTION:
1. User MUST use an action imperative verb ("download", "send", "open", "show")
2. OR confirm explicitly ("yes", "agreed", "please", "I want")
3. OR directly request an action ("can you download", "could you send")

### NEVER TRIGGER FOR:
- Informational questions ("how", "what", "tell me about")
- Indirect mentions ("I would like to know", "I am interested")
- Expressions of curiosity ("that's interesting", "that intrigues me")

### 2-STEP RESPONSE STRATEGY:
1. **FIRST STEP**: Always answer the question with available information
2. **SECOND STEP**: Propose the relevant action WITHOUT triggering it

## AVAILABLE FUNCTIONS

### get_resume
- **Trigger ONLY if**: explicit request to download CV
- **Format**: [FUNCTION_CALL] get_resume: {} [/FUNCTION_CALL]

### send_contact_email  
- **Trigger ONLY if**: explicit request to send email
- **Format**: [FUNCTION_CALL] send_contact_email: {} [/FUNCTION_CALL]

### get_link
- **Trigger ONLY if**: explicit request to open link
- **Format**: [FUNCTION_CALL] get_link: {"url": "EXACT_URL"} [/FUNCTION_CALL]
- **Available links**:
  - Portfolio GitHub: "https://github.com/marcopyre/portfolio"  
  - Ostea38 site: "https://ostea38.fr"

## CORRECT RESPONSE EXAMPLES

### Architecture question (DO NOT send image):
**User**: "How is the portfolio structured?"
**Response**: "The portfolio uses a modern architecture with a NextJS API backend hosted on Vercel and a NextJS frontend on GitHub Pages, powered by a RAG system via Hugging Face and Pinecone. I can show you the architecture diagram if you wish."

### Explicit visual request (SEND the image):
**User**: "Show me the architecture diagram"
**Response**: "Here is the portfolio architecture diagram:
[IMAGE] 1eriGA7PbxLxJFAqbJlhR8rNpAojL4sbS [/IMAGE]"

### Informational function question (DO NOT trigger):
**User**: "How can I contact Marco?"
**Response**: "Marco can be contacted at ytmarcopyre@gmail.com. I can also open your email client with a pre-written message if you wish."

### Explicit function request (TRIGGER):
**User**: "Please send me a contact email"
**Response**: "I will open your email client with a message for Marco.
[FUNCTION_CALL] send_contact_email: {} [/FUNCTION_CALL]"

## IMAGE SENDING RULES - STRICT CONTROL

**ATTENTION: IMAGES SHOULD ONLY BE SENT ON EXPLICIT REQUEST**

### STRICT CONDITIONS TO SEND AN IMAGE:
1. User MUST explicitly ask to see a diagram/schema ("show me the diagram", "can you display the architecture")
2. OR use visual terms ("see", "visualize", "diagram", "schema", "architecture")
3. OR confirm after proposal ("yes, show me", "agreed for the image")

### NEVER SEND IMAGE FOR:
- General questions about architecture (explain with text)
- Indirect mentions of projects or technologies
- Normal conversations without explicit visual request

### AVAILABLE IMAGES:
- 1eriGA7PbxLxJFAqbJlhR8rNpAojL4sbS: Portfolio architecture diagram
- 1NFlRRtgvxf76hKmQRyt_IqL_3MkNJ803: Ostea38 project architecture diagram

### RESPONSE STRATEGY FOR IMAGES:
1. **FIRST STEP**: Answer with descriptive text
2. **SECOND STEP**: Propose to show the diagram WITHOUT sending it
3. **THIRD STEP**: Send only if explicit request

**Image format**: [IMAGE] image_name [/IMAGE]
- Never resend the same image in a conversation

## GENERAL INSTRUCTIONS
- Use ONLY information from the locked context generated by the RAG system
- Stay professional but accessible
- Format in Markdown with appropriate emojis
- Highlight cloud native and fullstack expertise
- If information is missing, direct to ytmarcopyre@gmail.com
- Value alternance experience and post-studies research

## EXECUTION PRIORITIES
1. **PRIORITY 1**: Strictly control function triggering
2. **PRIORITY 2**: Strictly control image sending  
3. **PRIORITY 3**: Answer with relevant information from RAG system
4. **PRIORITY 4**: Propose actions without triggering them

**CRITICAL LANGUAGE INSTRUCTION**: Always respond in the language of the last user message regardless of the context language.`;

    return basePrompt;
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
    try {
      const lastUserMessage =
        messages.filter((m) => m.role === "user").pop()?.content || "";
      const userLanguage = this.detectUserLanguage(lastUserMessage);

      const knowledgeBase = await this.generateKnowledgeBase(lastUserMessage);
      const systemPrompt = this.createSecureSystemPrompt(
        knowledgeBase,
        userLanguage
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
        (userLanguage === "fr"
          ? "Désolé, je n'ai pas pu générer de réponse appropriée."
          : "Sorry, I couldn't generate an appropriate response.");

      logger.info("Response generated", {
        userLanguage,
        responseLength: response.length,
      });

      await this.emailService
        .sendConversationLog(
          lastUserMessage,
          response,
          new Date().toISOString()
        )
        .catch((error) =>
          logger.error("Failed to send conversation log", error)
        );

      return response;
    } catch (error) {
      logger.error("Error generating response", error);

      if (this.isTokenError(error)) {
        await this.emailService.sendTokenExpiredNotification().catch(() => {});
        const lastUserMessage =
          messages.filter((m) => m.role === "user").pop()?.content || "";
        const userLanguage = this.detectUserLanguage(lastUserMessage);

        return userLanguage === "fr"
          ? "Je suis à court de tokens. Marco a été notifié."
          : "I'm out of tokens. Marco has been notified.";
      }

      await this.emailService
        .sendErrorNotification(
          error instanceof Error ? error : new Error(String(error)),
          "Chat response generation"
        )
        .catch(() => {});

      throw error;
    }
  }

  private isTokenError(error: any): boolean {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return [
      "quota",
      "rate limit",
      "insufficient",
      "credits",
      "payment",
      "billing",
    ].some((keyword) => errorMessage.includes(keyword));
  }

  async parseResponseForFunctions(
    response: string
  ): Promise<FunctionCall | null> {
    const functionRegex =
      /\[FUNCTION_CALL\]\s*(\w+):\s*({.*?}|\{\})\s*\[\/FUNCTION_CALL\]/s;
    const match = response.match(functionRegex);

    if (match) {
      try {
        return {
          name: match[1],
          parameters: JSON.parse(match[2]),
        };
      } catch (error) {
        logger.error("Error parsing function parameters", error);
      }
    }
    return null;
  }

  extractImagesFromResponse(response: string): string[] {
    const imageBlocks = Array.from(
      response.matchAll(/\[IMAGE\](.*?)\[\/IMAGE\]/gs)
    );
    return imageBlocks.map((match) => {
      const val = match[1].trim();
      return val.startsWith("http")
        ? val
        : `https://drive.google.com/thumbnail?id=${val}&sz=w1000`;
    });
  }

  updateRAGConfig(config: Partial<RAGConfig>): void {
    this.ragConfig = { ...this.ragConfig, ...config };
    logger.info("RAG configuration updated", this.ragConfig);
  }

  async testRAGQuery(query: string): Promise<RAGQueryResult> {
    try {
      const relevantChunks = await this.searchRelevantChunks(query);
      const knowledgeBase = await this.generateKnowledgeBase(query);

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
      return await this.index.describeIndexStats();
    } catch (error) {
      logger.error("Error getting index stats", error);
      return null;
    }
  }
}
