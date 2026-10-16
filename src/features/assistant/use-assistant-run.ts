import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../../api/transport";

export type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
};

export type AssistantRunResponse = {
  answer: string;
  session_id?: string;
};

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
        body: JSON.stringify({ query: message, session_id: sessionId }),
      }),
  });
}

export function loadAssistantMessages(sessionId: string) {
  return apiFetch<AssistantMessage[]>(
    `/api/v1/conversations/${encodeURIComponent(sessionId)}/messages`,
  );
}
