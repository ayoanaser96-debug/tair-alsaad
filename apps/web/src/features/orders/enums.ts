/**
 * Submit values are the EXACT zod enums from apps/api
 * (validators/schemas.ts: shipmentPackageQuoteSchema, shipmentQuoteFields,
 * createShipmentSchema). Do not change the `value` strings — the API rejects
 * anything else. Labels are AR/EN; render per current language.
 */
export type EnumOption = { value: string; labelAr: string; labelEn: string };

/** package.type */
export const PACKAGE_TYPES: EnumOption[] = [
  { value: "envelope", labelAr: "مظروف", labelEn: "Envelope" },
  { value: "small", labelAr: "صغير", labelEn: "Small" },
  { value: "medium", labelAr: "متوسط", labelEn: "Medium" },
  { value: "large", labelAr: "كبير", labelEn: "Large" },
  { value: "fragile", labelAr: "قابل للكسر", labelEn: "Fragile" },
  { value: "cold", labelAr: "مبرّد", labelEn: "Cold / refrigerated" },
];

/** package.weightTier */
export const WEIGHT_TIERS: EnumOption[] = [
  { value: "light", labelAr: "خفيف", labelEn: "Light" },
  { value: "medium", labelAr: "متوسط", labelEn: "Medium" },
  { value: "heavy", labelAr: "ثقيل", labelEn: "Heavy" },
];

/** service */
export const SERVICES: EnumOption[] = [
  { value: "standard", labelAr: "عادي", labelEn: "Standard" },
  { value: "express", labelAr: "سريع", labelEn: "Express" },
  { value: "scheduled", labelAr: "مجدول", labelEn: "Scheduled" },
];

/** paymentMethod */
export const PAYMENT_METHODS: EnumOption[] = [
  { value: "cash_on_delivery", labelAr: "الدفع عند الاستلام", labelEn: "Cash on delivery" },
  { value: "zaincash", labelAr: "زين كاش", labelEn: "ZainCash" },
  { value: "fastpay", labelAr: "فاست باي", labelEn: "FastPay" },
  { value: "fib", labelAr: "FIB", labelEn: "FIB" },
  { value: "asia_hawala", labelAr: "آسيا حوالة", labelEn: "Asia Hawala" },
];

/** Pick the localized label for an enum option list. */
export function enumLabel(options: EnumOption[], value: string, lang: string): string {
  const opt = options.find((o) => o.value === value);
  if (!opt) return value;
  return lang.startsWith("ar") ? opt.labelAr : opt.labelEn;
}
