import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../auth/use-auth";
import { fetchCustomerServiceRequests } from "../api/service-request-api";

export function useServiceRequests() {
  const { user } = useAuth();
  const customerId = user?.id ?? null;

  const query = useQuery({
    queryKey: ["service-requests", customerId],
    enabled: Boolean(customerId),
    queryFn: () => fetchCustomerServiceRequests(),
  });

  return {
    requests: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
