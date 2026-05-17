import { z } from "zod";

export const financeSummarySchema = z.object({
  totalRevenue: z.number(),
  platformCommission: z.number(),
  driverPayoutsOwed: z.number(),
  refundsIssued: z.number(),
});

export const paymentTransactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  type: z.string(),
  amount: z.number(),
  party: z.string(),
  status: z.string(),
});

export type FinanceSummary = z.infer<typeof financeSummarySchema>;
export type PaymentTransactionRow = z.infer<typeof paymentTransactionSchema>;
