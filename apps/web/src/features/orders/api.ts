import { z } from "zod";

import {
  createPaymentMethodBodySchema,
  createSavedAddressBodySchema,
  estimateRequestSchema,
  estimateResponseSchema,
  notificationsResponseSchema,
  orderDetailResponseSchema,
  paymentMethodSingleResponseSchema,
  paymentMethodsResponseSchema,
  rateOrderBodySchema,
  savedAddressSingleResponseSchema,
  savedAddressesResponseSchema,
  senderOrderListSchema,
  senderStatsSchema,
  updateSavedAddressBodySchema,
  type AppNotification,
  type EstimateOrderInput,
  type OrderDetail,
  type SavedAddress,
  type SavedPaymentMethod,
  type SenderOrderList,
  type SenderStats,
} from "@/features/orders/schemas";
import { apiRequestUnchecked } from "@/lib/api/client";

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

export async function fetchSenderOrderListApi(params: SenderOrderListParams): Promise<SenderOrderList> {
  const sp = new URLSearchParams();
  sp.set("tab", params.tab);
  if (params.page) sp.set("page", String(params.page));
  if (params.limit) sp.set("limit", String(params.limit));
  if (params.search) sp.set("search", params.search);
  if (params.sort) sp.set("sort", params.sort);
  if (params.dateFrom) sp.set("dateFrom", params.dateFrom);
  if (params.dateTo) sp.set("dateTo", params.dateTo);
  if (params.status) sp.set("status", params.status);
  const raw = await apiRequestUnchecked<unknown>({
    method: "GET",
    url: `/orders/sender?${sp}`,
  });
  return senderOrderListSchema.parse(raw);
}

export async function fetchSenderStatsApi(): Promise<SenderStats> {
  const raw = await apiRequestUnchecked<unknown>({
    method: "GET",
    url: "/orders/sender/stats",
  });
  return senderStatsSchema.parse(raw);
}

export async function fetchSenderOrderApi(orderId: string): Promise<{ order: OrderDetail }> {
  const raw = await apiRequestUnchecked<unknown>({
    method: "GET",
    url: `/orders/${orderId}`,
  });
  return orderDetailResponseSchema.parse(raw);
}

export async function estimateOrderApi(body: EstimateOrderInput) {
  const parsed = estimateRequestSchema.parse(body);
  const raw = await apiRequestUnchecked<unknown>({
    method: "POST",
    url: "/orders/estimate",
    data: parsed,
  });
  return estimateResponseSchema.parse(raw);
}

export async function createOrderApi(body: Record<string, unknown>): Promise<{ order: OrderDetail }> {
  const raw = await apiRequestUnchecked<unknown>({
    method: "POST",
    url: "/orders",
    data: body,
  });
  return orderDetailResponseSchema.parse(raw);
}

export async function cancelOrderApi(orderId: string): Promise<{ order: OrderDetail }> {
  const raw = await apiRequestUnchecked<unknown>({
    method: "POST",
    url: `/orders/${orderId}/cancel`,
  });
  return orderDetailResponseSchema.parse(raw);
}

export async function rateOrderApi(orderId: string, rating: number, comment: string): Promise<{ order: OrderDetail }> {
  const data = rateOrderBodySchema.parse({ rating, comment });
  const raw = await apiRequestUnchecked<unknown>({
    method: "POST",
    url: `/orders/${orderId}/rate`,
    data,
  });
  return orderDetailResponseSchema.parse(raw);
}

export async function fetchSavedAddressesApi(): Promise<{ addresses: SavedAddress[] }> {
  const raw = await apiRequestUnchecked<unknown>({
    method: "GET",
    url: "/saved-addresses",
  });
  return savedAddressesResponseSchema.parse(raw);
}

export async function createSavedAddressApi(
  body: z.infer<typeof createSavedAddressBodySchema>,
): Promise<{ address: SavedAddress }> {
  const data = createSavedAddressBodySchema.parse(body);
  const raw = await apiRequestUnchecked<unknown>({
    method: "POST",
    url: "/saved-addresses",
    data,
  });
  return savedAddressSingleResponseSchema.parse(raw);
}

export async function updateSavedAddressApi(
  id: string,
  body: z.infer<typeof updateSavedAddressBodySchema>,
): Promise<{ address: SavedAddress }> {
  const data = updateSavedAddressBodySchema.parse(body);
  const raw = await apiRequestUnchecked<unknown>({
    method: "PATCH",
    url: `/saved-addresses/${id}`,
    data,
  });
  return savedAddressSingleResponseSchema.parse(raw);
}

export async function deleteSavedAddressApi(id: string): Promise<void> {
  await apiRequestUnchecked<unknown>({
    method: "DELETE",
    url: `/saved-addresses/${id}`,
  });
}

export async function fetchNotificationsApi(): Promise<{ notifications: AppNotification[] }> {
  const raw = await apiRequestUnchecked<unknown>({
    method: "GET",
    url: "/notifications",
  });
  return notificationsResponseSchema.parse(raw);
}

export async function markNotificationReadApi(id: string): Promise<void> {
  await apiRequestUnchecked<unknown>({
    method: "PATCH",
    url: `/notifications/${id}/read`,
  });
}

export async function fetchPaymentMethodsApi(): Promise<{ paymentMethods: SavedPaymentMethod[] }> {
  const raw = await apiRequestUnchecked<unknown>({
    method: "GET",
    url: "/payment-methods",
  });
  return paymentMethodsResponseSchema.parse(raw);
}

export async function createPaymentMethodApi(
  body: z.infer<typeof createPaymentMethodBodySchema>,
): Promise<{ paymentMethod: SavedPaymentMethod }> {
  const data = createPaymentMethodBodySchema.parse(body);
  const raw = await apiRequestUnchecked<unknown>({
    method: "POST",
    url: "/payment-methods",
    data,
  });
  return paymentMethodSingleResponseSchema.parse(raw);
}

export async function deletePaymentMethodApi(id: string): Promise<void> {
  await apiRequestUnchecked<unknown>({
    method: "DELETE",
    url: `/payment-methods/${id}`,
  });
}
