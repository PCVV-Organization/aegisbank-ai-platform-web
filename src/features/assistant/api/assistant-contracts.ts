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
  approvalRequests?: ApprovalRequest[] | undefined;
}

export interface ApprovalRequest {
  approval_id: string;
  tool_name: string;
  normalized_arguments: Record<string, unknown>;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXECUTED";
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
  approval_requests?: ApprovalRequest[];
}

export interface PersistedConversationTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  metadata?: {
    execution_mode?: ChatMessage["executionMode"];
    rounds?: number;
    tool_count?: number;
    latency_ms?: number;
  };
}
