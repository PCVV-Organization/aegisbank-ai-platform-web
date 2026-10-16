import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../../api/transport";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  executionMode?: "azure-foundry" | "deterministic" | "cloud-fallback";
}

export interface AssistantRunResponse {
  answer: string;
  session_id?: string;
  customer_id?: string;
  rounds?: number;
  execution_mode: "azure-foundry" | "deterministic" | "cloud-fallback";
}

export function useAssistantRun() {
  return useMutation({
    mutationFn: ({
      message,
      sessionId,
    }: {
      message: string;
      sessionId?: string;
    }) =>
      apiFetch<AssistantRunResponse>("/api/v1/agent/run", {
        method: "POST",
        body: JSON.stringify({
          query: message,
          session_id: sessionId,
        }),
      }),
  });
}
