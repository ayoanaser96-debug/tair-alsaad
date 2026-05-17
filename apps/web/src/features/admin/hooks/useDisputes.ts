import { useCallback, useMemo, useState } from "react";

import { MOCK_DISPUTES, type AdminDisputeRow } from "@/features/admin/mock/data";
import { useDisputesListQuery } from "@/features/disputes/hooks";
import type { DisputeRow } from "@/features/disputes/schemas";

function toAdminRow(d: DisputeRow): AdminDisputeRow {
  return d;
}

export function useDisputes() {
  const [query, setQuery] = useState("");
  const q = useDisputesListQuery();

  const rows = useMemo(() => {
    const raw: AdminDisputeRow[] =
      q.data && q.data.length > 0 ? q.data.map(toAdminRow) : [...MOCK_DISPUTES];
    if (!query.trim()) return raw;
    const qq = query.toLowerCase();
    return raw.filter(
      (d) => d.type.toLowerCase().includes(qq) || d.orderId.includes(qq) || d.id.includes(qq),
    );
  }, [q.data, query]);

  const refetch = useCallback(async () => {
    await q.refetch();
  }, [q.refetch]);

  return { rows, query, setQuery, refetch, loading: q.isFetching };
}

export type { AdminDisputeRow };
