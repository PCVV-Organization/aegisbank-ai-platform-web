import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("*/api/v1/agent/run", async ({ request }) => {
    const body = (await request.json()) as { query?: string };
    const query = body.query?.toLowerCase() ?? "";
    const answer = query.includes("balance")
      ? "Your available synthetic balance is $12,480.00."
      : query.includes("request")
        ? "You have 2 open synthetic service requests."
        : `I can help with your synthetic banking information. You asked: “${body.query ?? ""}”`;
    return HttpResponse.json({ answer });
  }),
];
