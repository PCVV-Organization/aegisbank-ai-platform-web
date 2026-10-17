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
  guidedRequest?: GuidedRequest | undefined;
}

export interface GuidedRequestOption {
  category?: string;
  reason_code?: string;
  label: string;
  description?: string;
  requires_description?: boolean;
}

export interface GuidedRequest {
  step: "CATEGORY" | "REASON" | "DESCRIPTION" | "CONFIRMATION" | "CONTACT_SUPPORT";
  category?: string;
  reason_code?: string;
  reason_label?: string;
  options?: GuidedRequestOption[];
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
  guided_request?: GuidedRequest;
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
