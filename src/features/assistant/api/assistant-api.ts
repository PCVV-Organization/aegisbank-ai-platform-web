import { apiFetch } from "../../../api/transport";
import type {
  AssistantRunInput,
  AssistantRunResponse,
  PersistedConversationTurn,
} from "./assistant-contracts";

export function runAssistant({
  message,
  sessionId,
  signal,
}: AssistantRunInput) {
  return apiFetch<AssistantRunResponse>("/api/v1/agent/run", {
    method: "POST",
    ...(signal ? { signal } : {}),
    body: JSON.stringify({
      query: message,
      session_id: sessionId,
    }),
  });
}

export function fetchConversationHistory(
  sessionId: string,
): Promise<PersistedConversationTurn[]> {
  return apiFetch<PersistedConversationTurn[]>(
    `/api/v1/conversations/${encodeURIComponent(sessionId)}`,
  );
}
