import { http, HttpResponse } from "msw";
import { buildSyntheticAnswer } from "./synthetic-assistant";

interface MockServiceRequest {
  service_request_id: string;
  customer_id: string;
  category: "LOAN" | "INSTALLMENT" | "FEE" | "GENERAL";
  description: string;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED";
  created_at: string;
}

let mockServiceRequests: MockServiceRequest[] = [
  {
    service_request_id: "SR-000001",
    customer_id: "CUST-0001",
    category: "LOAN",
    description: "Revisión de reprogramación de cuota de préstamo activo.",
    status: "OPEN",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    service_request_id: "SR-000002",
    customer_id: "CUST-0001",
    category: "FEE",
    description: "Consulta sobre cobro de comisión de mantenimiento en cuenta.",
    status: "IN_REVIEW",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const handlers = [
  http.post("*/api/v1/agent/run", async ({ request }) => {
    const body = (await request.json()) as { query?: string };
    const answer = buildSyntheticAnswer(body.query ?? "");
    return HttpResponse.json({ answer });
  }),

  // Service requests feed (authenticated me route)
  http.get("*/api/v1/me/service-requests", () => {
    return HttpResponse.json({ items: mockServiceRequests });
  }),

  // Service requests feed (collection route)
  http.get("*/api/v1/service-requests", () => {
    return HttpResponse.json(mockServiceRequests);
  }),

  // Service request creation
  http.post("*/api/v1/service-requests", async ({ request }) => {
    const body = (await request.json()) as {
      customer_id?: string;
      category?: "LOAN" | "INSTALLMENT" | "FEE" | "GENERAL";
      description?: string;
    };
    const nextId = `SR-${String(mockServiceRequests.length + 1).padStart(6, "0")}`;
    const newRecord: MockServiceRequest = {
      service_request_id: nextId,
      customer_id: body.customer_id || "CUST-0001",
      category: body.category || "GENERAL",
      description: body.description || "",
      status: "OPEN",
      created_at: new Date().toISOString(),
    };
    mockServiceRequests = [newRecord, ...mockServiceRequests];
    return HttpResponse.json(newRecord, { status: 201 });
  }),

  http.post("*/api/v1/me/service-requests", async ({ request }) => {
    const body = (await request.json()) as {
      customer_id?: string;
      category?: "LOAN" | "INSTALLMENT" | "FEE" | "GENERAL";
      description?: string;
    };
    const nextId = `SR-${String(mockServiceRequests.length + 1).padStart(6, "0")}`;
    const newRecord: MockServiceRequest = {
      service_request_id: nextId,
      customer_id: body.customer_id || "CUST-0001",
      category: body.category || "GENERAL",
      description: body.description || "",
      status: "OPEN",
      created_at: new Date().toISOString(),
    };
    mockServiceRequests = [newRecord, ...mockServiceRequests];
    return HttpResponse.json(newRecord, { status: 201 });
  }),

  http.post("*/api/v1/auth/refresh", () => {
    return HttpResponse.json({
      status: "ok",
      expires_at: Math.floor(Date.now() / 1000) + 900,
      expires_in: 900,
      csrf_token: "test-csrf-token",
    });
  }),
];
