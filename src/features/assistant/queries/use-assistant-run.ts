import { useMutation } from "@tanstack/react-query";
import { runAssistant } from "../api/assistant-api";

export function useAssistantRun() {
  return useMutation({ mutationFn: runAssistant });
}
