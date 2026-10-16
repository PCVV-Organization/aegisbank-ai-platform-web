import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../auth/use-auth";
import {
  createCustomerServiceRequest,
  fetchCustomerServiceRequests,
} from "../api/service-request-api";
import type {
  ServiceRequestCreatePayload,
  ServiceRequestItem,
} from "../api/service-request-contracts";

export function useServiceRequests() {
  const { user } = useAuth();
  const customerId = user?.id || "CUST-0001";
  const queryClient = useQueryClient();
  const queryKey = ["service-requests", customerId];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<ServiceRequestItem[]> => {
      return await fetchCustomerServiceRequests();
    },
  });

  const mutation = useMutation({
    mutationFn: async (
      payload: ServiceRequestCreatePayload,
    ): Promise<ServiceRequestItem> => {
      return await createCustomerServiceRequest(payload, customerId);
    },
    onSuccess: (newRecord) => {
      queryClient.setQueryData<ServiceRequestItem[]>(queryKey, (old) => {
        const existing = old || [];
        const filtered = existing.filter((item) => item.id !== newRecord.id);
        return [newRecord, ...filtered];
      });
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    requests: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createRequest: mutation.mutateAsync,
    isCreating: mutation.isPending,
    mutationError: mutation.error,
  };
}
