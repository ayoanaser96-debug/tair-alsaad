/**
 * Small compatibility barrel for the "@/api" import alias.
 *
 * The real HTTP client is the axios instance in "@/lib/api/client", which is
 * configured from `env.VITE_API_URL` and carries the auth + error interceptors.
 * This file only re-exports the handful of helpers/types consumed via "@/api".
 */
export type { HealthResponse } from "@/lib/api/health";
export { getHealth } from "@/lib/api/health";

export type { City } from "@/lib/api/cities";
export { getCities } from "@/lib/api/cities";

export type { OrderDTO } from "@/features/orders/schemas";
