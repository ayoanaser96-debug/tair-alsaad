import { z } from "zod";

import { apiRequest } from "@/lib/api/client";

const healthSchema = z.object({
  ok: z.boolean(),
  service: z.string(),
  database: z.string().optional(),
});

export type HealthResponse = z.infer<typeof healthSchema>;

export async function getHealth(): Promise<HealthResponse> {
  return apiRequest(healthSchema, { method: "GET", url: "/health" });
}
