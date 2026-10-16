import { apiFetch } from "../../../api/transport";
import type {
  AssistantRunInput,
  AssistantRunResponse,
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
