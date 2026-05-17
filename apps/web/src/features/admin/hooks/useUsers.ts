import { useCallback, useMemo, useState } from "react";

import { MOCK_USERS, type AdminUserRow } from "@/features/admin/mock/data";

export function useUsers() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");

  const rows = useMemo(() => {
    let r = [...MOCK_USERS];
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.includes(q) ||
          u.id.includes(q),
      );
    }
    if (status !== "all") r = r.filter((u) => u.status === status);
    return r;
  }, [query, status]);

  const refetch = useCallback(async () => {
    // TODO: GET /admin/users
  }, []);

  return { rows, query, setQuery, status, setStatus, refetch, loading: false };
}

export type { AdminUserRow };
