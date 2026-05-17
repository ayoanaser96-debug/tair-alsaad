import { useCallback, useMemo } from "react";

import { MOCK_PAYMENTS, type AdminPaymentRow } from "@/features/admin/mock/data";
import { useFinanceSummaryQuery, usePaymentTransactionsQuery } from "@/features/payments/hooks";
import type { FinanceSummary, PaymentTransactionRow } from "@/features/payments/schemas";

const fallbackSummary: FinanceSummary = {
  totalRevenue: 1_248_000,
  platformCommission: 187_200,
  driverPayoutsOwed: 42_300,
  refundsIssued: 12_400,
};

function toAdminRow(t: PaymentTransactionRow): AdminPaymentRow {
  return t;
}

export function usePayments() {
  const sumQ = useFinanceSummaryQuery();
  const txQ = usePaymentTransactionsQuery();

  const summary = useMemo(() => sumQ.data ?? fallbackSummary, [sumQ.data]);

  const transactions = useMemo(() => {
    if (txQ.data && txQ.data.length > 0) return txQ.data.map(toAdminRow);
    return [...MOCK_PAYMENTS];
  }, [txQ.data]);

  const refetch = useCallback(async () => {
    await Promise.all([sumQ.refetch(), txQ.refetch()]);
  }, [sumQ.refetch, txQ.refetch]);

  return {
    summary,
    transactions,
    refetch,
    loading: sumQ.isFetching || txQ.isFetching,
  };
}

export type { AdminPaymentRow };
