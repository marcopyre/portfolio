export const KNOWLEDGE_BASE_CONFIG = {
  datasetId: "marcopyre/portfolio-knowledge-base",
  embeddingModel: "sentence-transformers/all-MiniLM-L6-v2",
  knowledgeBaseEndpoint:
    "https://api-inference.huggingface.co/models/marcopyre/portfolio-kb",
  
  chunkSize: 512,
  chunkOverlap: 50,

  
  defaultTopK: 3,

  
  similarityThreshold: 0.3,
};

export const CACHE_DURATION = 30 * 60 * 1000;
export const MAX_MESSAGES = 10;