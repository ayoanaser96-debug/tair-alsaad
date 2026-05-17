import { useMemo } from "react";

import type { AdminStats } from "@/features/admin/schemas";
import { MOCK_ACTIVITY, MOCK_KPI_EXTRA } from "@/features/admin/mock/data";

import { useAdminStatsQuery } from "./queries";

export type OrdersTimePoint = { label: string; orders: number };
export type RevenueByCity = { city: string; revenue: number };

export function useAdminDashboard() {
  const { data, isLoading, isFetching, error, refetch } = useAdminStatsQuery();
  const stats: AdminStats | null = data ?? null;
  const loading = isLoading || (isFetching && !data);
  const errStr = error instanceof Error ? error.message : null;

  const ordersSeriesDaily: OrdersTimePoint[] = useMemo(
    () => [
      { label: "Mon", orders: 210 },
      { label: "Tue", orders: 245 },
      { label: "Wed", orders: 198 },
      { label: "Thu", orders: 260 },
      { label: "Fri", orders: 302 },
      { label: "Sat", orders: 280 },
      { label: "Sun", orders: 220 },
    ],
    [],
  );

  const statusDistribution = useMemo(() => {
    const o = stats?.ordersByStatus;
    if (!o)
      return [
        { name: "PENDING", value: 40 },
        { name: "DELIVERED", value: 120 },
        { name: "IN_TRANSIT", value: 35 },
      ];
    return Object.entries(o).map(([name, value]) => ({ name, value }));
  }, [stats]);

  const revenueByCity: RevenueByCity[] = useMemo(
    () => [
      { city: "Kuala Lumpur", revenue: 4200 },
      { city: "Petaling Jaya", revenue: 3100 },
      { city: "Shah Alam", revenue: 2100 },
      { city: "Putrajaya", revenue: 1800 },
      { city: "Cyberjaya", revenue: 1200 },
    ],
    [],
  );

  const activity = useMemo(() => [...MOCK_ACTIVITY], []);

  const kpi = useMemo(
    () => ({
      senders: MOCK_KPI_EXTRA.sendersCount,
      driversOnline: MOCK_KPI_EXTRA.activeDriversOnline,
      driversTotal: MOCK_KPI_EXTRA.activeDriversTotal,
      ordersToday: MOCK_KPI_EXTRA.ordersToday,
      ordersYesterdayPct:
        MOCK_KPI_EXTRA.ordersYesterday === 0
          ? 100
          : Math.round(
              ((MOCK_KPI_EXTRA.ordersToday - MOCK_KPI_EXTRA.ordersYesterday) / MOCK_KPI_EXTRA.ordersYesterday) * 1000,
            ) / 10,
      revenueToday: MOCK_KPI_EXTRA.revenueToday,
      revenueYesterdayPct:
        MOCK_KPI_EXTRA.revenueYesterday === 0
          ? 100
          : Math.round(
              ((MOCK_KPI_EXTRA.revenueToday - MOCK_KPI_EXTRA.revenueYesterday) / MOCK_KPI_EXTRA.revenueYesterday) *
                1000,
            ) / 10,
      pendingDisputes: MOCK_KPI_EXTRA.pendingDisputes,
      platformRating: MOCK_KPI_EXTRA.platformRating,
    }),
    [],
  );

  return {
    stats,
    loading,
    error: errStr,
    refresh: () => void refetch(),
    kpi,
    ordersSeriesDaily,
    statusDistribution,
    revenueByCity,
    activity,
  };
}
