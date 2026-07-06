/**
 * Features with no backing API endpoints yet. Flip to true only when the API
 * ships them. Everything gated here is hidden from nav, menus, routes, buttons,
 * and dashboard cards so nothing dead is reachable in production.
 *
 * Backing status (apps/api) as of this integration:
 * - notifications: no /notifications endpoints
 * - paymentMethods: no saved payment-method endpoints
 * - adminPromotions: no /admin/promotions endpoints
 * - adminFinance: no finance summary / transactions endpoints
 * - driverDecline: no "decline shipment" endpoint
 * - driverStats: no driver stats aggregation endpoint
 * - cityCreation: cities are admin-managed via PATCH only (no create)
 */
export const FEATURES = {
  notifications: false,
  paymentMethods: false,
  adminPromotions: false,
  adminFinance: false,
  driverDecline: false,
  driverStats: false,
  cityCreation: false,
} as const;

export type FeatureFlag = keyof typeof FEATURES;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURES[flag];
}
