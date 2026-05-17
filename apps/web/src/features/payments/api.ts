import { z } from "zod";

import {
  financeSummarySchema,
  paymentTransactionSchema,
  type FinanceSummary,
  type PaymentTransactionRow,
} from "@/features/payments/schemas";
import { apiRequestUnchecked } from "@/lib/api/client";

const transactionsSchema = z.array(paymentTransactionSchema);

export async function fetchFinanceSummaryApi(): Promise<FinanceSummary | null> {
  try {
    const raw = await apiRequestUnchecked<unknown>({ method: "GET", url: "/admin/finance/summary" });
    return financeSummarySchema.parse(raw);
  } catch {
    return null;
  }
}

export async function fetchPaymentTransactionsApi(): Promise<PaymentTransactionRow[]> {
  try {
    const raw = await apiRequestUnchecked<unknown>({ method: "GET", url: "/admin/finance/transactions" });
    return transactionsSchema.parse(raw);
  } catch {
    return [];
  }
}
