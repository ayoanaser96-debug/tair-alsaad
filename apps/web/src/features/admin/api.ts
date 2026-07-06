import { z } from "zod";

import {
  adminStatsSchema,
  promotionSchema,
  type AdminStats,
} from "@/features/admin/schemas";
import type { OrderDTO } from "@/features/orders/schemas";
import { orderDtoSchema } from "@/features/orders/schemas";
import { shipmentToOrderDto, unwrap, type RawShipment } from "@/lib/api/adapters";
import { apiRequestUnchecked } from "@/lib/api/client";

type RawOverview = {
  totalUsers?: number;
  totalDrivers?: number;
  pendingShipments?: number;
  shipmentsInFlight?: number;
  completedToday?: number;
  openDisputes?: number;
};

/**
 * Real API: GET /admin/overview -> { ok, data: {...counters} }.
 * The web `adminStatsSchema` wants users/orders/cities + status/role records.
 * The overview endpoint doesn't provide per-status/per-role breakdowns, so those
 * records are left empty (the dashboard falls back to its own placeholders).
 */
export async function fetchAdminStatsApi(): Promise<AdminStats> {
  const raw = await apiRequestUnchecked<unknown>({ method: "GET", url: "/admin/overview" });
  const o = unwrap<RawOverview>(raw);
  const orders =
    (o.pendingShipments ?? 0) + (o.shipmentsInFlight ?? 0) + (o.completedToday ?? 0);
  return adminStatsSchema.parse({
    users: o.totalUsers ?? 0,
    orders,
    cities: 0,
    ordersByStatus: {},
    usersByRole: {},
  });
}

/** Real API: GET /admin/shipments -> { ok, data: { items, total } }. */
export async function fetchAdminOrdersApi(): Promise<OrderDTO[]> {
  try {
    const raw = await apiRequestUnchecked<unknown>({ method: "GET", url: "/admin/shipments" });
    const data = unwrap<{ items?: RawShipment[] }>(raw);
    return (data.items ?? []).map((s) => orderDtoSchema.parse(shipmentToOrderDto(s)));
  } catch {
    return [];
  }
}

/** MISSING CAPABILITY: no promotions endpoint on the API. */
export async function fetchPromotionsApi() {
  return z.array(promotionSchema).parse([]);
}
