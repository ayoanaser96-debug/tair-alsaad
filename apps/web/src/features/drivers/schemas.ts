import { z } from "zod";

import { orderDtoSchema } from "@/features/orders/schemas";

export const driverOrdersResponseSchema = z.object({
  kind: z.literal("driver"),
  myDeliveries: z.array(orderDtoSchema),
  available: z.array(orderDtoSchema),
});

export type DriverOrdersBundle = z.infer<typeof driverOrdersResponseSchema>;

export const earningsRangeSchema = z.enum(["week", "month"]);
export type EarningsRange = z.infer<typeof earningsRangeSchema>;

export const driverEarningsSchema = z.object({
  range: earningsRangeSchema,
  total: z.number(),
  currency: z.string(),
  breakdown: z.array(z.object({ label: z.string(), amount: z.number() })),
});

export const driverStatsSchema = z.object({
  completedToday: z.number(),
  completedWeek: z.number(),
  ratingAvg: z.number(),
  reviewCount: z.number(),
  todayEarnings: z.number(),
});

export const driverDocumentSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: z.enum(["pending", "verified", "expired", "rejected"]),
  expiresAt: z.string().nullable(),
  url: z.string().nullable().optional(),
});

export const toggleOnlineInputSchema = z.object({
  online: z.boolean(),
});
