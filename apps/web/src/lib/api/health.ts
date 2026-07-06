import { z } from "zod";

import { apiClient } from "@/lib/api/client";
import { env } from "@/config/env";

/**
 * The real API serves health at the ROOT (`/health`), NOT under /api/v1.
 * We derive the origin from VITE_API_URL (which includes the /api/v1 prefix)
 * and hit `<origin>/health`. Response shape: { ok, service, db, uptime }.
 */
const healthSchema = z.object({
  ok: z.boolean(),
  service: z.string(),
  db: z.string().optional(),
  uptime: z.number().optional(),
});

export type HealthResponse = z.infer<typeof healthSchema>;

function healthUrl(): string {
  try {
    return new URL("/health", env.VITE_API_URL).toString();
  } catch {
    return "/health";
  }
}

export async function getHealth(): Promise<HealthResponse> {
  const res = await apiClient.request({ method: "GET", url: healthUrl() });
  return healthSchema.parse(res.data);
}
