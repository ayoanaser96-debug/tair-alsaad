import { z } from "zod";

import { apiRequestUnchecked } from "@/lib/api/client";
import { unwrap } from "@/lib/api/adapters";

const citySchema = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string(),
});

export type City = z.infer<typeof citySchema>;

/** Real API: GET /cities -> { ok, data: { cities: [{ key, nameAr, nameEn }] } }. */
const rawCitySchema = z.object({
  key: z.string(),
  nameAr: z.string().optional(),
  nameEn: z.string().optional(),
});

export async function getCities(): Promise<City[]> {
  const raw = await apiRequestUnchecked<unknown>({ method: "GET", url: "/cities" });
  const data = unwrap<{ cities?: unknown }>(raw);
  const cities = z.array(rawCitySchema).parse(data?.cities ?? []);
  return cities.map((c) => ({
    id: c.key,
    name: c.nameEn?.trim() || c.nameAr?.trim() || c.key,
    country: "IQ",
  }));
}

/**
 * MISSING CAPABILITY: the real API has no public "create city" route (cities are
 * managed via admin PATCH /admin/cities/:id only). Kept for signature
 * compatibility; throws a clear error instead of hitting a 404.
 */
export async function createCity(_body: { name: string; country: string }): Promise<City> {
  throw new Error("Creating cities is not supported by the API (admin-managed only).");
}
