import {
  type FinanceSummary,
  type PaymentTransactionRow,
} from "@/features/payments/schemas";

/**
 * MISSING CAPABILITY: the API has no finance/transactions endpoints
 * (/admin/finance/*). We return empty results directly instead of firing 404s.
 * The relevant admin driver payouts do exist (GET /admin/payouts,
 * POST /admin/payouts/:id/process) and could back a future finance view.
 */
export async function fetchFinanceSummaryApi(): Promise<FinanceSummary | null> {
  return null;
}

export async function fetchPaymentTransactionsApi(): Promise<PaymentTransactionRow[]> {
  return [];
}
