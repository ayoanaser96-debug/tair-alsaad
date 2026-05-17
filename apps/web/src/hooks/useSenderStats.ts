import { useSenderStatsQuery } from "@/features/orders/hooks";

export function useSenderStats() {
  const q = useSenderStatsQuery();
  return {
    data: q.data ?? null,
    loading: q.isPending,
    error: q.error instanceof Error ? q.error.message : q.error ? String(q.error) : null,
    refetch: q.refetch,
  };
}
