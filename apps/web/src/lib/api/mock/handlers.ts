import { http, HttpResponse } from "msw";

/** Path wildcards so mocks work regardless of VITE_API_URL host/port. */
export const handlers = [
  http.get("*/health", () =>
    HttpResponse.json({ ok: true, service: "tair-alsaad-api-mock", database: "connected" }),
  ),
  http.get("*/cities", () =>
    HttpResponse.json([{ id: "c1", name: "Baghdad", country: "IQ" }]),
  ),
];
