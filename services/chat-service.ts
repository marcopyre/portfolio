import { InferenceClient } from "@huggingface/inference";
import { ChatMessage, FunctionCall } from "../types";
import { logger } from "@/utils/logger";
import { EmailService } from "./email-service";

export class ChatService {
  private client: InferenceClient;
  private emailService: EmailService;

  constructor(token: string) {
    this.client = new InferenceClient(token);
    this.emailService = new EmailService();
    logger.info("ChatService initialized");
  }

  createSecureSystemPrompt(knowledgeBase: string): string {
    logger.debug("Creating system prompt", {
      knowledgeBaseLength: knowledgeBase.length,
    });

    return `# ASSISTANT MARCO PYRÉ - OPTIMISÉ POUR GEMMA 3 27B IT

Tu es un assistant spécialisé pour présenter Marco Pyré, développeur fullstack.

## CONTEXTE PRINCIPAL
${knowledgeBase}

Tu es développé via Hugging Face, alimenté par un système RAG, avec un backend API NextJS hébergé chez Vercel et un frontend NextJS sur GitHub Pages.

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
**Réponse** : "Le portfolio utilise une architecture moderne avec un backend API NextJS hébergé chez Vercel et un frontend NextJS sur GitHub Pages, alimenté par un système RAG via Hugging Face. Je peux vous montrer le schéma d'architecture si vous le souhaitez."

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

## INSTRUCTIONS GÉNÉRALES
- Répondre TOUJOURS dans la langue de l'utilisateur
- Utiliser uniquement les informations du contexte verrouillé
- Rester professionnel mais accessible
- Formater en Markdown avec des emojis appropriés
- Mettre en avant l'expertise cloud native et fullstack
- Si information manquante, diriger vers ytmarcopyre@gmail.com
- Valoriser l'expérience en alternance et la recherche post-études

## PRIORITÉS D'EXÉCUTION
1. **PRIORITÉ 1** : Contrôler strictement les déclenchements de fonctions
2. **PRIORITÉ 2** : Contrôler strictement l'envoi d'images  
3. **PRIORITÉ 3** : Répondre avec les informations pertinentes
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

  private convertMessagesToHuggingFaceFormat(messages: ChatMessage[]) {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    logger.info("Generating chat response", {
      messageCount: messages.length,
    });

    try {
      const compatibleMessages =
        this.convertMessagesToHuggingFaceFormat(messages);

      const chatCompletion = await this.client.chatCompletion({
        model: "google/gemma-3-27b-it",
        messages: compatibleMessages,
        temperature: 1.0,
        top_k: 64,
        top_p: 0.95,
      });

      const response =
        chatCompletion.choices[0]?.message?.content ||
        "Désolé, je n'ai pas pu générer de réponse appropriée.";

      logger.info("Chat response generated successfully", {
        responseLength: response.length,
      });

      const lastUserMessage =
        messages.filter((m) => m.role === "user").pop()?.content || "";

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
      logger.error("Error generating chat response", error);

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
          "Chat response generation"
        );
      } catch (emailError) {
        logger.error("Failed to send error notification", emailError);
      }

      throw error;
    }
  }
}
