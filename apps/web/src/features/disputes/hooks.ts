import { useQuery } from "@tanstack/react-query";

import { fetchDisputesListApi } from "@/features/disputes/api";
import { useAuthStore } from "@/features/auth/store";

const root = ["disputes"] as const;

export const disputeKeys = {
  all: root,
  list: () => [...root, "list"] as const,
};

export function useDisputesListQuery() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: disputeKeys.list(),
    queryFn: () => fetchDisputesListApi(),
    enabled: !!token,
  });
}
