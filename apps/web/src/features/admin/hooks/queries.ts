import { useQuery } from "@tanstack/react-query";

import { fetchAdminOrdersApi, fetchAdminStatsApi } from "@/features/admin/api";
import { useAuthStore } from "@/features/auth/store";

const root = ["admin"] as const;

export const adminKeys = {
  all: root,
  stats: () => [...root, "stats"] as const,
  orders: () => [...root, "orders"] as const,
};

const POLL_MS = 25_000;

export function useAdminStatsQuery() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: () => fetchAdminStatsApi(),
    enabled: !!token,
    refetchInterval: POLL_MS,
  });
}

export function useAdminOrdersQuery() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: adminKeys.orders(),
    queryFn: () => fetchAdminOrdersApi(),
    enabled: !!token,
  });
}
