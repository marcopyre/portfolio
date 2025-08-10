export interface FunctionCall {
  name: string;
  parameters?: Record<string, unknown>;
}

export interface FunctionResponse {
  action: string;
  params?: Record<string, unknown>;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface APIResponse {
  response: string | FunctionResponse;
  metadata: {
    useRAG?: boolean;
    knowledgeBaseSource?: string;
    functionTriggered?: string;
    error?: string;
    timestamp: string;
  };
  images?: string[];
}

export interface RAGConfig {
  minScore: number;
  maxChunks: number;
  minChunks: number;
  scoreThreshold: number;
  maxTokens?: number;
}

export interface RelevantChunk {
  text: string;
  score: number;
  chunkIndex: number;
  tokenCount?: number;
  category?: string;
  type?: string;
  name?: string;
}

export interface RAGQueryResult {
  question: string;
  answer: string;
  sources: Array<{
    score: number;
    preview: string;
  }>;
}
