import { useQuery } from "@tanstack/react-query";
import { fetchConversationHistory } from "../api/assistant-api";
import type { PersistedConversationTurn } from "../api/assistant-contracts";

export function useConversationHistory(sessionId: string | null | undefined) {
  return useQuery<PersistedConversationTurn[]>({
    queryKey: ["conversation-history", sessionId],
    enabled: Boolean(sessionId),
    queryFn: () =>
      sessionId ? fetchConversationHistory(sessionId) : Promise.resolve([]),
    staleTime: 60_000,
  });
}
