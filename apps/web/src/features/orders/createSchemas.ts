import { z } from "zod";

/**
 * Client-side mirror of the REAL apps/api zod contract for
 * POST /shipments/quote and POST /shipments (validators/schemas.ts).
 * Keep in sync with the API — the API is the source of truth.
 */

export const addressInputSchema = z.object({
  label: z.string().optional(),
  city: z.string().min(1),
  area: z.string().min(1),
  street: z.string().optional(),
  building: z.string().optional(),
  notes: z.string().optional(),
  location: z.object({ lat: z.number(), lng: z.number() }),
});

export const packageInputSchema = z.object({
  type: z.enum(["envelope", "small", "medium", "large", "fragile", "cold"]),
  weightTier: z.enum(["light", "medium", "heavy"]),
  description: z.string().optional(),
  declaredValue: z.number().optional(),
});

export const quoteInputSchema = z.object({
  pickup: addressInputSchema,
  dropoff: addressInputSchema,
  package: packageInputSchema,
  service: z.enum(["standard", "express", "scheduled"]),
  scheduledFor: z.string().optional(),
});

export const createShipmentInputSchema = quoteInputSchema.extend({
  receiver: z.object({
    name: z.string().min(1),
    phone: z.string().min(5),
  }),
  paymentMethod: z.enum(["cash_on_delivery", "zaincash", "fastpay", "fib", "asia_hawala"]),
});

export const quoteResultSchema = z.object({
  pricing: z.object({
    base: z.number(),
    distance: z.number(),
    surcharge: z.number(),
    surge: z.number(),
    total: z.number(),
    driverPayout: z.number(),
  }),
  etaMinutes: z.number(),
});

export type QuoteInput = z.infer<typeof quoteInputSchema>;
export type CreateShipmentInput = z.infer<typeof createShipmentInputSchema>;
export type QuoteResult = z.infer<typeof quoteResultSchema>;
