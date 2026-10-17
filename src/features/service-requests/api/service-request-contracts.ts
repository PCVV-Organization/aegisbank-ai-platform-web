export type ServiceRequestCategory = "LOAN" | "INSTALLMENT" | "FEE" | "GENERAL";

export type ServiceRequestStatus = "OPEN" | "IN_REVIEW" | "RESOLVED";
export type ServiceRequestReasonCode =
  | "LOAN_RESTRUCTURING"
  | "LOAN_BALANCE_DISPUTE"
  | "LOAN_INTEREST_RATE"
  | "LOAN_PAYMENT_DIFFICULTY"
  | "INSTALLMENT_DATE"
  | "INSTALLMENT_DUPLICATE_CHARGE"
  | "INSTALLMENT_AMOUNT_DISPUTE"
  | "INSTALLMENT_PAYMENT_NOT_REFLECTED"
  | "INSTALLMENT_OVERDUE_DISPUTE"
  | "FEE_UNRECOGNIZED"
  | "FEE_DUPLICATE_CHARGE"
  | "FEE_AMOUNT_DISPUTE"
  | "FEE_REFUND_REQUEST"
  | "GENERAL_FRAUD"
  | "GENERAL_ACCOUNT_ACCESS"
  | "GENERAL_DATA_UPDATE"
  | "GENERAL_STATUS"
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
