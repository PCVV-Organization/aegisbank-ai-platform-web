export type ServiceRequestCategory = "LOAN" | "INSTALLMENT" | "FEE" | "GENERAL";

export type ServiceRequestStatus = "OPEN" | "IN_REVIEW" | "RESOLVED";
export type ServiceRequestReasonCode =
  | "LOAN_RESTRUCTURING"
  | "LOAN_BALANCE_DISPUTE"
  | "INSTALLMENT_DATE"
  | "INSTALLMENT_DUPLICATE_CHARGE"
  | "INSTALLMENT_AMOUNT_DISPUTE"
  | "FEE_UNRECOGNIZED"
  | "FEE_DUPLICATE_CHARGE"
  | "GENERAL_OTHER";

export interface ServiceRequestItem {
  id: string;
  category: ServiceRequestCategory;
  summary: string;
  status: ServiceRequestStatus;
  reasonCode?: ServiceRequestReasonCode | undefined;
  reasonLabel?: string | undefined;
  createdAt: string;
}

export interface ServiceRequestCreatePayload {
  category: ServiceRequestCategory;
  summary: string;
  customerId?: string;
  reasonCode: ServiceRequestReasonCode;
  reasonLabel: string;
}

export interface BackendServiceRequestItem {
  service_request_id: string;
  customer_id?: string;
  category: ServiceRequestCategory;
  description: string;
  status: ServiceRequestStatus;
  reason_code?: ServiceRequestReasonCode;
  reason_label?: string;
  created_at: string;
}

export interface BackendServiceRequestListResponse {
  items: BackendServiceRequestItem[];
}
