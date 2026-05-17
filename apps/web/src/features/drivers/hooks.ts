import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";

import type { OrderDTO } from "@/features/orders/schemas";
import i18n from "@/i18n/config";
import {
  fetchDriverDocumentsApi,
  fetchDriverEarningsApi,
  fetchDriverOrdersBundleApi,
  fetchDriverStatsApi,
  postAcceptOrderApi,
  postDeclineOrderApi,
} from "@/features/drivers/api";
import type { DriverOrdersBundle, EarningsRange } from "@/features/drivers/schemas";
import { useAuthStore } from "@/features/auth/store";

const DRIVER_ROOT = ["drivers"] as const;

export const driverKeys = {
  all: DRIVER_ROOT,
  orders: () => [...DRIVER_ROOT, "orders"] as const,
  earnings: (range: EarningsRange) => [...DRIVER_ROOT, "earnings", range] as const,
  stats: () => [...DRIVER_ROOT, "stats"] as const,
  documents: () => [...DRIVER_ROOT, "documents"] as const,
};

function useIsDriver() {
  return useAuthStore((s) => s.user?.role === "DRIVER");
}

export function useDriverOrdersQuery(online: boolean) {
  const token = useAuthStore((s) => s.accessToken);
  const isDriver = useIsDriver();
  return useQuery({
    queryKey: driverKeys.orders(),
    queryFn: () => fetchDriverOrdersBundleApi(),
    enabled: !!token && isDriver,
    refetchInterval: online ? 5000 : false,
  });
}

export function useDriverEarningsQuery(range: EarningsRange, enabled = true) {
  const token = useAuthStore((s) => s.accessToken);
  const isDriver = useIsDriver();
  return useQuery({
    queryKey: driverKeys.earnings(range),
    queryFn: () => fetchDriverEarningsApi(range),
    enabled: !!token && isDriver && enabled,
    retry: 0,
  });
}

export function useDriverStatsQuery(enabled = true) {
  const token = useAuthStore((s) => s.accessToken);
  const isDriver = useIsDriver();
  return useQuery({
    queryKey: driverKeys.stats(),
    queryFn: () => fetchDriverStatsApi(),
    enabled: !!token && isDriver && enabled,
    retry: 0,
  });
}

export function useDriverDocumentsQuery() {
  const token = useAuthStore((s) => s.accessToken);
  const isDriver = useIsDriver();
  return useQuery({
    queryKey: driverKeys.documents(),
    queryFn: () => fetchDriverDocumentsApi(),
    enabled: !!token && isDriver,
    retry: 0,
  });
}

export function useAcceptOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => postAcceptOrderApi(orderId),
    onMutate: async (orderId) => {
      await qc.cancelQueries({ queryKey: driverKeys.orders() });
      const prev = qc.getQueryData<DriverOrdersBundle>(driverKeys.orders());
      if (prev) {
        const moving = prev.available.find((o) => o.id === orderId);
        if (!moving) return { prev };
        qc.setQueryData<DriverOrdersBundle>(driverKeys.orders(), {
          ...prev,
          available: prev.available.filter((o) => o.id !== orderId),
          myDeliveries: [moving, ...prev.myDeliveries],
        });
      }
      return { prev };
    },
    onError: (err: Error, _, ctx) => {
      if (ctx?.prev) qc.setQueryData(driverKeys.orders(), ctx.prev);
      toast.error(err.message || i18n.t("toasts.couldNotAcceptOrder"));
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: driverKeys.orders() });
    },
  });
}

export function useDeclineOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => postDeclineOrderApi(orderId),
    onMutate: async (orderId) => {
      await qc.cancelQueries({ queryKey: driverKeys.orders() });
      const prev = qc.getQueryData<DriverOrdersBundle>(driverKeys.orders());
      if (prev) {
        qc.setQueryData<DriverOrdersBundle>(driverKeys.orders(), {
          ...prev,
          available: prev.available.filter((o) => o.id !== orderId),
        });
      }
      return { prev };
    },
    onError: (err: Error, _, ctx) => {
      if (ctx?.prev) qc.setQueryData(driverKeys.orders(), ctx.prev);
      toast.error(err.message || i18n.t("toasts.couldNotDecline"));
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: driverKeys.orders() });
      toast.success(i18n.t("toasts.offerDeclined"));
    },
  });
}

export function orderDtoToAvailableOffer(o: OrderDTO): import("@/pages/driver/driverMock").AvailableOffer {
  return {
    id: o.id,
    pickupLabel: o.pickupAddress,
    dropLabel: o.dropAddress,
    distanceKm: 6 + (o.id.length % 7),
    estimatedEarnings: o.price,
    currency: "MYR",
    packageType: o.packageType,
    senderRating: 4.75,
    senderName: o.sender.name,
    etaMinutes: 12 + (o.id.charCodeAt(0) % 10),
    expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
  };
}

export function useAvailableOrdersList(online: boolean) {
  const q = useDriverOrdersQuery(online);
  const offers = useMemo(() => {
    if (!q.data?.available) return [];
    return q.data.available.map(orderDtoToAvailableOffer);
  }, [q.data]);
  const lastUpdated = q.dataUpdatedAt ? new Date(q.dataUpdatedAt) : null;
  return {
    offers,
    loading: q.isFetching,
    error: q.error instanceof Error ? q.error.message : null,
    lastUpdated,
    refetch: q.refetch,
    raw: q.data,
  };
}
