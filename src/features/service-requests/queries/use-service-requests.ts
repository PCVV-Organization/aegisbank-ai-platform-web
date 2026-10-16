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
  const customerId = user?.id || "anonymous";
  const queryClient = useQueryClient();
  const queryKey = ["service-requests", customerId];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<ServiceRequestItem[]> => {
      return await fetchCustomerServiceRequests();
    },
    // Service-request state is customer-visible banking data: never trust a
    // time-based cache as the current source of truth.
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const mutation = useMutation({
    mutationFn: async (
      payload: ServiceRequestCreatePayload,
    ): Promise<ServiceRequestItem> => {
      return await createCustomerServiceRequest(payload);
    },
    onSuccess: async (newRecord) => {
      queryClient.setQueryData<ServiceRequestItem[]>(queryKey, (old) => {
        const existing = old || [];
        const filtered = existing.filter((item) => item.id !== newRecord.id);
        return [newRecord, ...filtered];
      });
      // A successful Core Banking write invalidates the list and waits for a
      // fresh server response. Failed writes leave the previous cache intact.
      await queryClient.invalidateQueries({ queryKey, refetchType: "active" });
    },
  });

  return {
    requests: query.data || [],
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createRequest: mutation.mutateAsync,
    isCreating: mutation.isPending,
    mutationError: mutation.error,
  };
}
