import { z } from "zod";

import { orderDtoSchema } from "@/features/orders/schemas";

export const adminStatsSchema = z.object({
  users: z.number(),
  orders: z.number(),
  cities: z.number(),
  ordersByStatus: z.record(z.string(), z.number()),
  usersByRole: z.record(z.string(), z.number()),
});

export const ordersAdminResponseSchema = z.object({
  kind: z.literal("admin"),
  orders: z.array(orderDtoSchema),
});

export const revenueStatsSchema = z.object({
  range: z.string(),
  points: z.array(z.object({ at: z.string(), amount: z.number() })),
});

export const promotionSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  active: z.boolean(),
  discountPct: z.number().nullable(),
});

export const pricingConfigSchema = z.object({
  baseFare: z.number(),
  perKm: z.number(),
  perKg: z.number(),
});

export const auditLogEntrySchema = z.object({
  id: z.string(),
  action: z.string(),
  actorId: z.string(),
  createdAt: z.string(),
  meta: z.record(z.unknown()).optional(),
});

export const userListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  phone: z.string(),
  status: z.string().optional(),
});

export const driverListItemSchema = userListItemSchema.extend({
  verified: z.boolean().optional(),
});

export type AdminStats = z.infer<typeof adminStatsSchema>;
export type OrdersAdminPayload = z.infer<typeof ordersAdminResponseSchema>;
