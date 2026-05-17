import { z } from "zod";

import {
  driverDocumentSchema,
  driverEarningsSchema,
  driverOrdersResponseSchema,
  driverStatsSchema,
  type EarningsRange,
} from "@/features/drivers/schemas";
import { apiRequestUnchecked } from "@/lib/api/client";

export async function fetchDriverOrdersBundleApi() {
  const raw = await apiRequestUnchecked<unknown>({ method: "GET", url: "/orders" });
  return driverOrdersResponseSchema.parse(raw);
}

export async function postDriverOnlineStatusApi(online: boolean) {
  await apiRequestUnchecked({
    method: "POST",
    url: "/drivers/me/status",
    data: { online },
  });
}

export async function postAcceptOrderApi(orderId: string) {
  await apiRequestUnchecked({ method: "POST", url: `/drivers/orders/${orderId}/accept` });
}

export async function postDeclineOrderApi(orderId: string) {
  await apiRequestUnchecked({ method: "POST", url: `/drivers/orders/${orderId}/decline` });
}

export async function fetchDriverEarningsApi(range: EarningsRange) {
  const raw = await apiRequestUnchecked<unknown>({
    method: "GET",
    url: `/drivers/me/earnings`,
    params: { range },
  });
  return driverEarningsSchema.parse(raw);
}

export async function fetchDriverStatsApi() {
  const raw = await apiRequestUnchecked<unknown>({ method: "GET", url: "/drivers/me/stats" });
  return driverStatsSchema.parse(raw);
}

export async function fetchDriverDocumentsApi() {
  const raw = await apiRequestUnchecked<unknown>({ method: "GET", url: "/drivers/me/documents" });
  return z.object({ documents: z.array(driverDocumentSchema) }).parse(raw);
}
