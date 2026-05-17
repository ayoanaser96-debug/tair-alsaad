import { useQuery } from "@tanstack/react-query";

import { fetchFinanceSummaryApi, fetchPaymentTransactionsApi } from "@/features/payments/api";
import { useAuthStore } from "@/features/auth/store";

const root = ["payments", "admin"] as const;

export const paymentKeys = {
  all: root,
  summary: () => [...root, "summary"] as const,
  transactions: () => [...root, "transactions"] as const,
};

export function useFinanceSummaryQuery() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: paymentKeys.summary(),
    queryFn: () => fetchFinanceSummaryApi(),
    enabled: !!token,
  });
}

export function usePaymentTransactionsQuery() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: paymentKeys.transactions(),
    queryFn: () => fetchPaymentTransactionsApi(),
    enabled: !!token,
  });
}
