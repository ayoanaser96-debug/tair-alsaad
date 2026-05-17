const ADMIN_BASE = "/dashboard/admin";

/** Maps path segment after `/dashboard/admin` to `admin.nav` key. */
const PATH_TO_NAV: Record<string, string> = {
  "": "overview",
  users: "users",
  drivers: "drivers",
  orders: "orders",
  payments: "payments",
  disputes: "disputes",
  reviews: "reviews",
  analytics: "analytics",
  promotions: "promotions",
  "service-areas": "serviceAreas",
  pricing: "pricing",
  notifications: "notifications",
  audit: "audit",
  roles: "roles",
  settings: "settings",
  support: "support",
};

export const ADMIN_DASHBOARD_BASE = ADMIN_BASE;

export function getAdminNavKeyFromPath(pathname: string): string | null {
  if (!pathname.startsWith(ADMIN_BASE)) return null;
  const rest = pathname.slice(ADMIN_BASE.length).replace(/^\//, "");
  return PATH_TO_NAV[rest] ?? null;
}
