import type { SenderOrderListParams } from "@/features/orders/api";
import { useSenderOrderListQuery } from "@/features/orders/hooks";

export type { SenderOrderListParams };
/** @deprecated Use SenderOrderListParams */
export type SenderOrdersParams = SenderOrderListParams;

export function useSenderOrders(params: SenderOrderListParams) {
  const q = useSenderOrderListQuery(params);
  return {
    data: q.data ?? null,
    loading: q.isPending,
    error: q.error instanceof Error ? q.error.message : q.error ? String(q.error) : null,
    refetch: q.refetch,
  };
}
