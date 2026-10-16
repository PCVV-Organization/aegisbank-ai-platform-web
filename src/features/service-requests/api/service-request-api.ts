import { apiFetch } from "../../../api/transport";
import type {
  BackendServiceRequestItem,
  BackendServiceRequestListResponse,
  ServiceRequestCreatePayload,
  ServiceRequestItem,
} from "./service-request-contracts";

export function mapBackendItemToDomain(
  item: BackendServiceRequestItem,
): ServiceRequestItem {
  return {
    id: item.service_request_id,
    category: item.category,
    summary: item.description,
    status: item.status,
    createdAt: item.created_at,
  };
}

export async function fetchCustomerServiceRequests(): Promise<
  ServiceRequestItem[]
> {
  const response = await apiFetch<
    BackendServiceRequestListResponse | BackendServiceRequestItem[]
  >("/api/v1/me/service-requests");

  if (response && "items" in response && Array.isArray(response.items)) {
    return response.items.map(mapBackendItemToDomain);
  }
  if (Array.isArray(response)) {
    return response.map(mapBackendItemToDomain);
  }
  return [];
}

export async function createCustomerServiceRequest(
  payload: ServiceRequestCreatePayload,
): Promise<ServiceRequestItem> {
  const body = {
    category: payload.category,
    description: payload.summary,
  };

  const response = await apiFetch<BackendServiceRequestItem>(
    "/api/v1/service-requests",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );

  return mapBackendItemToDomain(response);
}
