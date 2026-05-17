import type { TFunction } from "i18next";
import { z } from "zod";

export function createPromoFormSchema(t: TFunction) {
  return z.object({
    code: z
      .string()
      .min(2, { message: t("admin.promotions.validation.codeMin") })
      .max(32, { message: t("admin.promotions.validation.codeMax") }),
    discountType: z.enum(["percent", "fixed"]),
    value: z.coerce.number().positive({ message: t("admin.promotions.validation.valuePositive") }),
    minOrder: z.coerce.number().min(0),
    usageLimit: z.coerce.number().int().positive({ message: t("admin.promotions.validation.usagePositive") }),
    expires: z.string().min(1, { message: t("admin.promotions.validation.expiresRequired") }),
    audience: z.enum(["all", "new", "referral"]),
  });
}

export function createDisputeDecisionSchema(t: TFunction) {
  return z.object({
    decision: z.enum(["sender", "driver", "partial", "full", "no_action"]),
    note: z.string().min(3, { message: t("admin.disputes.validation.noteMin") }),
  });
}

export function createDriverRejectSchema(t: TFunction) {
  return z.object({
    reason: z.string().min(3, { message: t("admin.drivers.validation.rejectReasonMin") }),
  });
}

export function createPricingFormSchema(t: TFunction) {
  return z.object({
    baseFare: z.coerce.number().min(0, { message: t("admin.pricing.validation.nonNegative") }),
    perKm: z.coerce.number().min(0, { message: t("admin.pricing.validation.nonNegative") }),
    perKg: z.coerce.number().min(0, { message: t("admin.pricing.validation.nonNegative") }),
    minFare: z.coerce.number().min(0, { message: t("admin.pricing.validation.nonNegative") }),
    peakSurge: z.coerce.number().min(1, { message: t("admin.pricing.validation.surgeMin") }),
    packageType: z.enum(["standard", "express", "fragile"]),
  });
}

export function createBroadcastFormSchema(t: TFunction) {
  return z.object({
    audience: z.enum(["all_senders", "all_drivers", "both"]),
    title: z
      .string()
      .min(3, { message: t("admin.notifications.validation.titleMin") })
      .max(200, { message: t("admin.notifications.validation.titleMax") }),
    body: z
      .string()
      .min(10, { message: t("admin.notifications.validation.bodyMin") })
      .max(2000, { message: t("admin.notifications.validation.bodyMax") }),
  });
}

export function createUserNoteSchema(t: TFunction) {
  return z.object({
    note: z.string().max(2000, { message: t("admin.users.validation.noteMax") }),
  });
}

export type PromoFormValues = z.infer<ReturnType<typeof createPromoFormSchema>>;
export type DisputeDecisionFormValues = z.infer<ReturnType<typeof createDisputeDecisionSchema>>;
export type DriverRejectFormValues = z.infer<ReturnType<typeof createDriverRejectSchema>>;
export type PricingFormValues = z.infer<ReturnType<typeof createPricingFormSchema>>;
export type BroadcastFormValues = z.infer<ReturnType<typeof createBroadcastFormSchema>>;
export type UserNoteFormValues = z.infer<ReturnType<typeof createUserNoteSchema>>;
