import { KNOWLEDGE_BASE_CONFIG, CACHE_DURATION } from "@/config/constants";
import { logger } from "@/utils/logger";
import { InferenceClient } from "@huggingface/inference";
import { EmailService } from "./email-service";

let knowledgeBaseCache: string | null = null;
let cacheTimestamp = 0;

export class KnowledgeBaseService {
  private client: InferenceClient;
  private emailService: EmailService;

  constructor(token: string) {
    this.client = new InferenceClient(token);
    this.emailService = new EmailService();
    logger.info("KnowledgeBaseService initialized");
  }

  async fetchKnowledgeBaseFromDataset(): Promise<string> {
    logger.info("Fetching knowledge base from dataset", {
      datasetId: KNOWLEDGE_BASE_CONFIG.datasetId,
    });

    try {
      const response = await fetch(
        `https://datasets-server.huggingface.co/rows?dataset=${KNOWLEDGE_BASE_CONFIG.datasetId}&config=default&split=train`,
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        logger.error("Failed to fetch dataset", {
          status: response.status,
          statusText: response.statusText,
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const knowledgeBase = data.rows
        .map((row: { row: { content: unknown } }) => row.row.content)
        .join("\n\n");

      logger.info("Knowledge base fetched successfully", {
        contentLength: knowledgeBase.length,
        rowCount: data.rows.length,
      });

      return knowledgeBase;
    } catch (error) {
      logger.error("Error fetching knowledge base from dataset", error);

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
        logger.warn(
          "Hugging Face token/credits error detected in knowledge base",
          {
            error: errorMessage,
          }
        );

        try {
          await this.emailService.sendTokenExpiredNotification();
        } catch (emailError) {
          logger.error("Failed to send token expired notification", emailError);
        }
      }

      throw error;
    }
  }

  async fetchRelevantContext(query: string): Promise<string> {
    logger.info("Fetching relevant context via RAG", { query });

    try {
      const queryEmbedding = await this.client.featureExtraction({
        model: KNOWLEDGE_BASE_CONFIG.embeddingModel,
        inputs: query,
      });

      logger.debug("Query embedding generated", {
        embeddingLength: Array.isArray(queryEmbedding)
          ? queryEmbedding.length
          : "unknown",
      });

      const response = await fetch(
        `${KNOWLEDGE_BASE_CONFIG.knowledgeBaseEndpoint}/search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.HF_TOKEN}`,
          },
          body: JSON.stringify({
            query: query,
            embedding: queryEmbedding,
            top_k: 3,
          }),
        }
      );

      if (!response.ok) {
        logger.error("RAG API error", {
          status: response.status,
          statusText: response.statusText,
        });
        throw new Error(`RAG API error: ${response.status}`);
      }

      const data = await response.json();
      const relevantContext = data.relevant_context || "";

      logger.info("Relevant context fetched successfully", {
        contextLength: relevantContext.length,
      });

      return relevantContext;
    } catch (error) {
      logger.error("Error fetching relevant context", error);

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
        logger.warn("Hugging Face token/credits error detected in RAG", {
          error: errorMessage,
        });

        try {
          await this.emailService.sendTokenExpiredNotification();
        } catch (emailError) {
          logger.error("Failed to send token expired notification", emailError);
        }
      }

      return "";
    }
  }

  async getKnowledgeBase(): Promise<string> {
    const now = Date.now();

    if (knowledgeBaseCache && now - cacheTimestamp < CACHE_DURATION) {
      logger.debug("Using cached knowledge base", {
        cacheAge: now - cacheTimestamp,
        cacheSize: knowledgeBaseCache.length,
      });
      return knowledgeBaseCache;
    }

    logger.info("Cache expired or empty, fetching fresh knowledge base");

    try {
      const knowledgeBase = await this.fetchKnowledgeBaseFromDataset();

      knowledgeBaseCache = knowledgeBase;
      cacheTimestamp = now;

      logger.info("Knowledge base cached successfully", {
        cacheSize: knowledgeBase.length,
      });

      return knowledgeBase;
    } catch (error) {
      logger.error("Error fetching knowledge base, using fallback", error);
      return this.getFallbackKnowledgeBase();
    }
  }

  private getFallbackKnowledgeBase(): string {
    const fallback = `
Marco Pyré - Développeur Fullstack & Cloud
- Email: ytmarcopyre@gmail.com
- GitHub: https://github.com/marcopyre
- Expérience: Alternant chez Deloitte (2022-2025)
- Compétences: Cloud Native, TypeScript, Architecture
- Recherche: CDI post-études 2025
`;

    logger.warn("Using fallback knowledge base", {
      fallbackLength: fallback.length,
    });

    return fallback;
  }
}
