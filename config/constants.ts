import { KnowledgeBaseConfig } from "../types";

export const KNOWLEDGE_BASE_CONFIG: KnowledgeBaseConfig = {
  datasetId: "marcopyre/portfolio-knowledge-base",
  embeddingModel: "sentence-transformers/all-MiniLM-L6-v2",
  knowledgeBaseEndpoint:
    "https://api-inference.huggingface.co/models/marcopyre/portfolio-kb",
};

export const CACHE_DURATION = 30 * 60 * 1000;
export const MAX_MESSAGES = 10;
export const MAX_TOKENS = 400;
export const TEMPERATURE = 0.6;
export const TOP_P = 0.9;
export const FREQUENCY_PENALTY = 0.1;
export const PRESENCE_PENALTY = 0.1;
