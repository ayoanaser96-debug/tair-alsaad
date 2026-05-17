import { useCallback, useMemo, useState } from "react";

import { MOCK_DRIVERS, type AdminDriverRow } from "@/features/admin/mock/data";

export function useDrivers() {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    if (!query.trim()) return [...MOCK_DRIVERS];
    const q = query.toLowerCase();
    return MOCK_DRIVERS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q) ||
        d.vehicle.toLowerCase().includes(q) ||
        d.id.includes(q),
    );
  }, [query]);

  const pendingApplications = useMemo(() => MOCK_DRIVERS.filter((d) => d.verification === "pending"), []);

  const refetch = useCallback(async () => {
    // TODO: GET /admin/drivers
  }, []);

  return { rows, pendingApplications, query, setQuery, refetch, loading: false };
}

export type { AdminDriverRow };
