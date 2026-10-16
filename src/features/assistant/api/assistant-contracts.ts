export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  executionMode?:
    | "azure-foundry"
    | "deterministic"
    | "cloud-fallback"
    | undefined;
  latencyMs?: number | undefined;
  toolCount?: number | undefined;
  rounds?: number | undefined;
}

export interface AssistantRunInput {
  message: string;
  sessionId?: string;
  signal?: AbortSignal;
}

export interface AssistantRunResponse {
  answer: string;
  session_id?: string;
  customer_id?: string;
  rounds?: number;
  execution_mode: "azure-foundry" | "deterministic" | "cloud-fallback";
  latency_ms?: number;
  tool_count?: number;
}
