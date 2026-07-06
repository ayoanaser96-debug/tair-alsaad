import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import i18n from "@/i18n/config";

import {
  cancelOrderApi,
  createShipmentApi,
  createPaymentMethodApi,
  createSavedAddressApi,
  deletePaymentMethodApi,
  deleteSavedAddressApi,
  fetchNotificationsApi,
  fetchPaymentMethodsApi,
  fetchSavedAddressesApi,
  fetchSenderOrderApi,
  fetchSenderOrderListApi,
  fetchSenderStatsApi,
  markNotificationReadApi,
  rateOrderApi,
  updateSavedAddressApi,
  type SenderOrderListParams,
} from "@/features/orders/api";
import type { CreateShipmentInput } from "@/features/orders/createSchemas";
import type { OrderDetail, SenderOrderList } from "@/features/orders/schemas";
import { updateSavedAddressBodySchema } from "@/features/orders/schemas";
import { useAuthStore } from "@/features/auth/store";

const root = ["shipments"] as const;

/** Stable query key factory for sender shipment resources (API: /shipments/*). */
export const orderKeys = {
  all: root,
  sender: {
    root: () => [...root, "sender"] as const,
    list: (p: SenderOrderListParams) => [...root, "sender", "list", p] as const,
    stats: () => [...root, "sender", "stats"] as const,
  },
  detail: (id: string) => [...root, "detail", id] as const,
  savedAddresses: () => [...root, "saved-addresses"] as const,
  notifications: () => [...root, "notifications"] as const,
  paymentMethods: () => [...root, "payment-methods"] as const,
};

/** @deprecated Prefer orderKeys.sender.* */
export const senderOrderKeys = {
  all: orderKeys.sender.root(),
  list: orderKeys.sender.list,
  stats: orderKeys.sender.stats,
};

export function useSenderOrderListQuery(params: SenderOrderListParams) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: orderKeys.sender.list(params),
    queryFn: () => fetchSenderOrderListApi(params),
    enabled: !!token,
  });
}

export function useSenderStatsQuery() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: orderKeys.sender.stats(),
    queryFn: () => fetchSenderStatsApi(),
    enabled: !!token,
  });
}

export function useSenderOrderQuery(orderId: string | null, open: boolean) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: orderId ? orderKeys.detail(orderId) : ["shipments", "detail", "none"],
    queryFn: () => fetchSenderOrderApi(orderId!),
    enabled: !!token && !!orderId && open,
    retry: 1,
  });
}

export function useCreateOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateShipmentInput) => createShipmentApi(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orderKeys.sender.root() });
    },
    // Errors are surfaced by CreateOrderForm.submit() with a contextual toast.
  });
}

export function useCancelOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => cancelOrderApi(orderId),
    onMutate: async (orderId) => {
      await qc.cancelQueries({ queryKey: orderKeys.detail(orderId) });
      const detailKey = orderKeys.detail(orderId);
      const previousDetail = qc.getQueryData<{ order: OrderDetail }>(detailKey);
      const listEntries = qc.getQueriesData<SenderOrderList>({ queryKey: orderKeys.sender.root() });

      if (previousDetail) {
        qc.setQueryData(detailKey, {
          order: { ...previousDetail.order, status: "CANCELLED" },
        });
      }
      listEntries.forEach(([key, data]) => {
        if (!data?.orders) return;
        qc.setQueryData(key, {
          ...data,
          orders: data.orders.map((o) => (o.id === orderId ? { ...o, status: "CANCELLED" } : o)),
        });
      });
      return { previousDetail, listEntries };
    },
    onError: (e: Error, orderId, ctx) => {
      toast.error(e.message || i18n.t("toasts.requestFailed"));
      const detailKey = orderKeys.detail(orderId);
      if (ctx?.previousDetail) qc.setQueryData(detailKey, ctx.previousDetail);
      ctx?.listEntries.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
    },
    onSuccess: (_, orderId) => {
      void qc.invalidateQueries({ queryKey: orderKeys.sender.root() });
      void qc.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      toast.success(i18n.t("toasts.orderCancelled"));
    },
  });
}

export function useRateOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, rating, comment }: { orderId: string; rating: number; comment: string }) =>
      rateOrderApi(orderId, rating, comment),
    onMutate: async ({ orderId, rating, comment }) => {
      await qc.cancelQueries({ queryKey: orderKeys.detail(orderId) });
      const detailKey = orderKeys.detail(orderId);
      const previousDetail = qc.getQueryData<{ order: OrderDetail }>(detailKey);
      const listEntries = qc.getQueriesData<SenderOrderList>({ queryKey: orderKeys.sender.root() });

      if (previousDetail) {
        qc.setQueryData(detailKey, {
          order: { ...previousDetail.order, rating, reviewComment: comment },
        });
      }
      listEntries.forEach(([key, data]) => {
        if (!data?.orders) return;
        qc.setQueryData(key, {
          ...data,
          orders: data.orders.map((o) =>
            o.id === orderId ? { ...o, rating, reviewComment: comment } : o,
          ),
        });
      });
      return { previousDetail, listEntries };
    },
    onError: (e: Error, { orderId }, ctx) => {
      toast.error(e.message || i18n.t("toasts.requestFailed"));
      const detailKey = orderKeys.detail(orderId);
      if (ctx?.previousDetail) qc.setQueryData(detailKey, ctx.previousDetail);
      ctx?.listEntries.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
    },
    onSuccess: (_, { orderId }) => {
      void qc.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      void qc.invalidateQueries({ queryKey: orderKeys.sender.root() });
      toast.success(i18n.t("toasts.thanksFeedback"));
    },
  });
}

export function useSavedAddressesQuery() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: orderKeys.savedAddresses(),
    queryFn: () => fetchSavedAddressesApi(),
    enabled: !!token,
  });
}

export function useCreateSavedAddressMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSavedAddressApi,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orderKeys.savedAddresses() });
      toast.success(i18n.t("toasts.addressSaved"));
    },
    onError: (e: Error) => toast.error(e.message || i18n.t("toasts.requestFailed")),
  });
}

export function useUpdateSavedAddressMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: z.infer<typeof updateSavedAddressBodySchema> }) =>
      updateSavedAddressApi(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orderKeys.savedAddresses() });
      toast.success(i18n.t("toasts.addressUpdated"));
    },
    onError: (e: Error) => toast.error(e.message || i18n.t("toasts.requestFailed")),
  });
}

export function useDeleteSavedAddressMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSavedAddressApi,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orderKeys.savedAddresses() });
      toast.success(i18n.t("toasts.addressRemoved"));
    },
    onError: (e: Error) => toast.error(e.message || i18n.t("toasts.requestFailed")),
  });
}

export function useNotificationsQuery(enabled: boolean) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: orderKeys.notifications(),
    queryFn: () => fetchNotificationsApi(),
    enabled: !!token && enabled,
  });
}

export function useMarkNotificationReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markNotificationReadApi,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orderKeys.notifications() });
    },
    onError: (e: Error) => toast.error(e.message || i18n.t("toasts.requestFailed")),
  });
}

export function usePaymentMethodsQuery() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: orderKeys.paymentMethods(),
    queryFn: () => fetchPaymentMethodsApi(),
    enabled: !!token,
  });
}

export function useCreatePaymentMethodMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPaymentMethodApi,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orderKeys.paymentMethods() });
      toast.success(i18n.t("toasts.paymentMethodAdded"));
    },
    onError: (e: Error) => toast.error(e.message || i18n.t("toasts.requestFailed")),
  });
}

export function useDeletePaymentMethodMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePaymentMethodApi,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orderKeys.paymentMethods() });
      toast.success(i18n.t("toasts.removed"));
    },
    onError: (e: Error) => toast.error(e.message || i18n.t("toasts.requestFailed")),
  });
}
