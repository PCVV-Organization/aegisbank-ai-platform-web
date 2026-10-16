export type ServiceRequestCategory = "LOAN" | "INSTALLMENT" | "FEE" | "GENERAL";

export type ServiceRequestStatus = "OPEN" | "IN_REVIEW" | "RESOLVED";

export interface ServiceRequestItem {
  id: string;
  category: ServiceRequestCategory;
  summary: string;
  status: ServiceRequestStatus;
  createdAt: string;
}

export interface ServiceRequestCreatePayload {
  category: ServiceRequestCategory;
  summary: string;
  customerId?: string;
}

export interface BackendServiceRequestItem {
  service_request_id: string;
  customer_id?: string;
  category: ServiceRequestCategory;
  description: string;
  status: ServiceRequestStatus;
  created_at: string;
}

export interface BackendServiceRequestListResponse {
  items: BackendServiceRequestItem[];
}
