import { useMemo, useState } from "react";

import type { OrderDTO } from "@/features/orders/schemas";

import { useAdminOrdersQuery } from "./queries";

export function useOrders() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const q = useAdminOrdersQuery();

  const orders: OrderDTO[] = q.data ?? [];

  const rows = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  return {
    rows,
    orders,
    loading: q.isFetching,
    error: q.error instanceof Error ? q.error.message : null,
    statusFilter,
    setStatusFilter,
    refresh: () => void q.refetch(),
  };
}
