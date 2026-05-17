import { z } from "zod";

import { apiRequest } from "@/lib/api/client";

const citySchema = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string(),
});

export type City = z.infer<typeof citySchema>;

export async function getCities(): Promise<City[]> {
  return apiRequest(z.array(citySchema), { method: "GET", url: "/cities" });
}

export async function createCity(body: { name: string; country: string }): Promise<City> {
  return apiRequest(citySchema, {
    method: "POST",
    url: "/cities",
    data: { name: body.name.trim(), country: body.country.trim() },
  });
}
