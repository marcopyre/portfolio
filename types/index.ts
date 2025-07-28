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
