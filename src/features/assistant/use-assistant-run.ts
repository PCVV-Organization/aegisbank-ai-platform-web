import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../../api/transport";
import { getCustomerId } from "../../auth/use-auth";

export function useAssistantRun() {
  return useMutation({
    mutationFn: (message: string) =>
      apiFetch<{ answer: string }>("/api/v1/agent/run", {
        method: "POST",
        body: JSON.stringify({ query: message, customer_id: getCustomerId() }),
      }),
  });
}
