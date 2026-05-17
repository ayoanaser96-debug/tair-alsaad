import { z } from "zod";

import {
  adminStatsSchema,
  ordersAdminResponseSchema,
  promotionSchema,
  type AdminStats,
} from "@/features/admin/schemas";
import type { OrderDTO } from "@/features/orders/schemas";
import { apiRequestUnchecked } from "@/lib/api/client";

export async function fetchAdminStatsApi(): Promise<AdminStats> {
  const raw = await apiRequestUnchecked<unknown>({ method: "GET", url: "/stats" });
  return adminStatsSchema.parse(raw);
}

export async function fetchAdminOrdersApi(): Promise<OrderDTO[]> {
  const raw = await apiRequestUnchecked<unknown>({ method: "GET", url: "/orders" });
  const parsed = ordersAdminResponseSchema.safeParse(raw);
  if (parsed.success) return parsed.data.orders;
  return [];
}

export async function fetchPromotionsApi() {
  try {
    const raw = await apiRequestUnchecked<unknown>({ method: "GET", url: "/admin/promotions" });
    return z.array(promotionSchema).parse(raw);
  } catch {
    return [];
  }
}
