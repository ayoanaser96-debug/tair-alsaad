import {
  driverDocumentSchema,
  driverEarningsSchema,
  driverOrdersResponseSchema,
  driverStatsSchema,
  type EarningsRange,
} from "@/features/drivers/schemas";
import { orderDtoSchema } from "@/features/orders/schemas";
import { shipmentToOrderDto, unwrap, type RawShipment } from "@/lib/api/adapters";
import { apiRequestUnchecked } from "@/lib/api/client";
import { z } from "zod";

/**
 * Real API split: the driver's current job is GET /driver/active-shipment.
 * The "available" feed (GET /shipments/feed) requires live lat/lng/radius that
 * this bundle call doesn't have, so it's returned empty here (see missing caps).
 */
export async function fetchDriverOrdersBundleApi() {
  const raw = await apiRequestUnchecked<unknown>({ method: "GET", url: "/driver/active-shipment" });
  const active = unwrap<RawShipment | null>(raw);
  const myDeliveries = active ? [orderDtoSchema.parse(shipmentToOrderDto(active))] : [];
  return driverOrdersResponseSchema.parse({
    kind: "driver",
    myDeliveries,
    available: [],
  });
}

/** Real API: PATCH /driver/online { isOnline }. */
export async function postDriverOnlineStatusApi(online: boolean) {
  await apiRequestUnchecked({
    method: "PATCH",
    url: "/driver/online",
    data: { isOnline: online },
  });
}

/** Real API: POST /shipments/:id/accept. */
export async function postAcceptOrderApi(orderId: string) {
  await apiRequestUnchecked({ method: "POST", url: `/shipments/${orderId}/accept` });
}

/** MISSING CAPABILITY: the API has no "decline shipment" route. */
export async function postDeclineOrderApi(_orderId: string) {
  throw new Error("Declining a shipment is not supported by the API.");
}

type RawEarnings = {
  available?: number;
  pendingPayout?: number;
  totalEarned?: number;
  recent?: Array<{ trackingCode?: string; pricing?: { total?: number } }>;
};

/** Real API: GET /driver/earnings -> { available, pendingPayout, totalEarned, recent }. */
export async function fetchDriverEarningsApi(range: EarningsRange) {
  const raw = await apiRequestUnchecked<unknown>({ method: "GET", url: "/driver/earnings" });
  const e = unwrap<RawEarnings>(raw);
  const breakdown = (e.recent ?? []).map((r) => ({
    label: r.trackingCode ?? "—",
    amount: r.pricing?.total ?? 0,
  }));
  return driverEarningsSchema.parse({
    range,
    total: e.totalEarned ?? 0,
    currency: "IQD",
    breakdown,
  });
}

/**
 * MISSING CAPABILITY: the API has no driver stats aggregation endpoint. Returns
 * zeros so the UI renders rather than 404-ing.
 */
export async function fetchDriverStatsApi() {
  return driverStatsSchema.parse({
    completedToday: 0,
    completedWeek: 0,
    ratingAvg: 0,
    reviewCount: 0,
    todayEarnings: 0,
  });
}

type RawDriverDocs = {
  documents?: { idFrontUrl?: string; idBackUrl?: string; licenseUrl?: string; vehicleRegUrl?: string };
};

/** Derived from GET /driver/me (the driver profile carries document URLs). */
export async function fetchDriverDocumentsApi() {
  const raw = await apiRequestUnchecked<unknown>({ method: "GET", url: "/driver/me" });
  const profile = unwrap<RawDriverDocs>(raw);
  const d = profile.documents ?? {};
  const entries: Array<{ id: string; label: string; url?: string }> = [
    { id: "idFront", label: "ID (front)", url: d.idFrontUrl },
    { id: "idBack", label: "ID (back)", url: d.idBackUrl },
    { id: "license", label: "Driver license", url: d.licenseUrl },
    { id: "vehicleReg", label: "Vehicle registration", url: d.vehicleRegUrl },
  ];
  const documents = entries
    .filter((e) => !!e.url)
    .map((e) =>
      driverDocumentSchema.parse({
        id: e.id,
        label: e.label,
        status: "pending" as const,
        expiresAt: null,
        url: e.url ?? null,
      }),
    );
  return z.object({ documents: z.array(driverDocumentSchema) }).parse({ documents });
}
