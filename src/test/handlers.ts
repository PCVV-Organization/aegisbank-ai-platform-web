import { http, HttpResponse } from "msw";
import { buildSyntheticAnswer } from "./synthetic-assistant";

export const handlers = [
  http.post("*/api/v1/agent/run", async ({ request }) => {
    const body = (await request.json()) as { query?: string };
    const answer = buildSyntheticAnswer(body.query ?? "");
    return HttpResponse.json({ answer });
  }),
];
