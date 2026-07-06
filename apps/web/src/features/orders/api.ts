import { z } from "zod";

import {
  createPaymentMethodBodySchema,
  createSavedAddressBodySchema,
  notificationsResponseSchema,
  orderDetailResponseSchema,
  paymentMethodsResponseSchema,
  savedAddressSingleResponseSchema,
  savedAddressesResponseSchema,
  senderOrderListSchema,
  senderStatsSchema,
  updateSavedAddressBodySchema,
  type AppNotification,
  type OrderDetail,
  type SavedAddress,
  type SavedPaymentMethod,
  type SenderOrderList,
  type SenderStats,
} from "@/features/orders/schemas";
import {
  createShipmentInputSchema,
  quoteInputSchema,
  quoteResultSchema,
  type CreateShipmentInput,
  type QuoteInput,
  type QuoteResult,
} from "@/features/orders/createSchemas";
import {
  shipmentMatchesTab,
  shipmentToOrderDetail,
  unwrap,
  type RawShipment,
} from "@/lib/api/adapters";
import { apiRequestUnchecked } from "@/lib/api/client";

/**
 * Sender shipment API layer — all paths match apps/api (frozen contract):
 *   GET  /shipments/mine
 *   GET  /shipments/:id
 *   POST /shipments/quote
 *   POST /shipments
 *   POST /shipments/:id/cancel
 *   POST /shipments/:id/rate
 */

export type SenderOrderListParams = {
  tab: "active" | "completed" | "cancelled" | "drafts";
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
};

type MineResponse = { items?: RawShipment[]; total?: number };

/**
 * Real API: GET /shipments/mine?page&limit&status -> { ok, data: { items, total } }.
 * The web's tabs (active/completed/cancelled/drafts) don't map 1:1 to a single
 * API status, so we fetch a page and bucket client-side.
 */
export async function fetchSenderOrderListApi(params: SenderOrderListParams): Promise<SenderOrderList> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const raw = await apiRequestUnchecked<unknown>({
    method: "GET",
    url: "/shipments/mine",
    // API caps limit at 100; fetch the max page so client-side tab bucketing is accurate.
    params: { page, limit: 100 },
  });
  const data = unwrap<MineResponse>(raw);
  const all = (data.items ?? []).filter((s) => shipmentMatchesTab(String(s.status ?? ""), params.tab));
  const orders = all.map((s) => shipmentToOrderDetail(s));
  const total = orders.length;
  return senderOrderListSchema.parse({
    orders,
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
}

/**
 * Sender KPI tiles. The API has no dedicated stats endpoint, so we derive totals
 * from the shipment list. Period-over-period trends/deltas are NOT available
 * from the API (no historical series) and are reported as 0.
 */
export async function fetchSenderStatsApi(): Promise<SenderStats> {
  const raw = await apiRequestUnchecked<unknown>({
    method: "GET",
    url: "/shipments/mine",
    // API caps limit at 100 (paginationQuerySchema); derive totals from the first page.
    params: { page: 1, limit: 100 },
  });
  const data = unwrap<MineResponse>(raw);
  const items = data.items ?? [];
  // TODO: replace with server-side stats endpoint — client derivation breaks once list is paginated.
  const count = (pred: (s: string) => boolean) =>
    items.filter((s) => pred(String(s.status ?? "").toLowerCase())).length;

  const totals = {
    total: typeof data.total === "number" ? data.total : items.length,
    inTransit: count((s) => ["assigned", "arrived_pickup", "picked_up", "in_transit", "arrived_dropoff"].includes(s)),
    delivered: count((s) => s === "delivered"),
    pendingPickup: count((s) => s === "pending"),
  };
  const zero = { total: 0, inTransit: 0, delivered: 0, pendingPickup: 0 };
  return senderStatsSchema.parse({ totals, trends: zero, deltaPct: zero });
}

export async function fetchSenderOrderApi(orderId: string): Promise<{ order: OrderDetail }> {
  const raw = await apiRequestUnchecked<unknown>({
    method: "GET",
    url: `/shipments/${orderId}`,
  });
  const shipment = unwrap<RawShipment>(raw);
  return orderDetailResponseSchema.parse({ order: shipmentToOrderDetail(shipment) });
}

/**
 * Live price quote. Real API: POST /shipments/quote -> { ok, data: { pricing, etaMinutes } }.
 * Requires pickup city + pickup/dropoff coordinates and typed package/service enums,
 * all now collected by the map-based create form.
 */
export async function quoteShipmentApi(input: QuoteInput): Promise<QuoteResult> {
  const body = quoteInputSchema.parse(input);
  const raw = await apiRequestUnchecked<unknown>({
    method: "POST",
    url: "/shipments/quote",
    data: body,
  });
  return quoteResultSchema.parse(unwrap(raw));
}

/**
 * Create a shipment. Real API: POST /shipments -> 201 { ok, data: <shipment doc> }.
 */
export async function createShipmentApi(input: CreateShipmentInput): Promise<{ order: OrderDetail }> {
  const body = createShipmentInputSchema.parse(input);
  const raw = await apiRequestUnchecked<unknown>({
    method: "POST",
    url: "/shipments",
    data: body,
  });
  const shipment = unwrap<RawShipment>(raw);
  return orderDetailResponseSchema.parse({ order: shipmentToOrderDetail(shipment) });
}

export async function cancelOrderApi(orderId: string, reason = "Cancelled by sender"): Promise<{ order: OrderDetail }> {
  const raw = await apiRequestUnchecked<unknown>({
    method: "POST",
    url: `/shipments/${orderId}/cancel`,
    data: { reason },
  });
  const shipment = unwrap<RawShipment>(raw);
  return orderDetailResponseSchema.parse({ order: shipmentToOrderDetail(shipment) });
}

export async function rateOrderApi(orderId: string, rating: number, comment: string): Promise<{ order: OrderDetail }> {
  const raw = await apiRequestUnchecked<unknown>({
    method: "POST",
    url: `/shipments/${orderId}/rate`,
    data: { stars: rating, ...(comment ? { comment } : {}) },
  });
  const shipment = unwrap<RawShipment>(raw);
  return orderDetailResponseSchema.parse({ order: shipmentToOrderDetail(shipment) });
}

type RawUserAddress = {
  _id?: string;
  id?: string;
  label?: string;
  city?: string;
  area?: string;
  street?: string;
  building?: string;
};

function userAddressToSaved(a: RawUserAddress): SavedAddress {
  const line1 = [a.area, a.street, a.building].filter(Boolean).join(", ");
  return {
    id: String(a._id ?? a.id ?? ""),
    label: a.label ?? "",
    line1,
    cityId: a.city ?? null,
    phone: null,
    contactName: null,
    city: a.city ? { id: a.city, name: a.city, country: "IQ" } : null,
  };
}

/** Real API stores addresses on the user: GET /me -> data.defaultAddresses[]. */
export async function fetchSavedAddressesApi(): Promise<{ addresses: SavedAddress[] }> {
  const raw = await apiRequestUnchecked<unknown>({ method: "GET", url: "/me" });
  const user = unwrap<{ defaultAddresses?: RawUserAddress[] }>(raw);
  const addresses = (user.defaultAddresses ?? []).map(userAddressToSaved);
  return savedAddressesResponseSchema.parse({ addresses });
}

/** POST /me/addresses returns the full user; we return the newest address. */
export async function createSavedAddressApi(
  body: z.infer<typeof createSavedAddressBodySchema>,
): Promise<{ address: SavedAddress }> {
  const parsed = createSavedAddressBodySchema.parse(body);
  const raw = await apiRequestUnchecked<unknown>({
    method: "POST",
    url: "/me/addresses",
    // Map web fields -> API address subdocument (requires city + area + location).
    data: {
      label: parsed.label,
      city: parsed.cityId ?? "",
      area: parsed.line1,
      location: { lat: 0, lng: 0 },
    },
  });
  const user = unwrap<{ defaultAddresses?: RawUserAddress[] }>(raw);
  const list = user.defaultAddresses ?? [];
  const last = list[list.length - 1];
  return savedAddressSingleResponseSchema.parse({
    address: userAddressToSaved(last ?? {}),
  });
}

export async function updateSavedAddressApi(
  id: string,
  body: z.infer<typeof updateSavedAddressBodySchema>,
): Promise<{ address: SavedAddress }> {
  const parsed = updateSavedAddressBodySchema.parse(body);
  const data: Record<string, unknown> = {};
  if (parsed.label !== undefined) data.label = parsed.label;
  if (parsed.line1 !== undefined) data.area = parsed.line1;
  if (parsed.cityId !== undefined && parsed.cityId !== null) data.city = parsed.cityId;
  const raw = await apiRequestUnchecked<unknown>({
    method: "PATCH",
    url: `/me/addresses/${id}`,
    data,
  });
  const user = unwrap<{ defaultAddresses?: RawUserAddress[] }>(raw);
  const found = (user.defaultAddresses ?? []).find((a) => String(a._id ?? a.id) === id);
  return savedAddressSingleResponseSchema.parse({ address: userAddressToSaved(found ?? {}) });
}

export async function deleteSavedAddressApi(id: string): Promise<void> {
  await apiRequestUnchecked<unknown>({
    method: "DELETE",
    url: `/me/addresses/${id}`,
  });
}

/**
 * MISSING CAPABILITY: the API has no notifications endpoints. Returns empty so
 * the UI renders an empty state instead of erroring/404-ing.
 */
export async function fetchNotificationsApi(): Promise<{ notifications: AppNotification[] }> {
  return notificationsResponseSchema.parse({ notifications: [] });
}

export async function markNotificationReadApi(_id: string): Promise<void> {
  // No-op: no notifications endpoint on the API.
}

/** MISSING CAPABILITY: no payment-methods endpoints on the API. */
export async function fetchPaymentMethodsApi(): Promise<{ paymentMethods: SavedPaymentMethod[] }> {
  return paymentMethodsResponseSchema.parse({ paymentMethods: [] });
}

export async function createPaymentMethodApi(
  _body: z.infer<typeof createPaymentMethodBodySchema>,
): Promise<{ paymentMethod: SavedPaymentMethod }> {
  throw new Error("Saved payment methods are not supported by the API.");
}

export async function deletePaymentMethodApi(_id: string): Promise<void> {
  throw new Error("Saved payment methods are not supported by the API.");
}
