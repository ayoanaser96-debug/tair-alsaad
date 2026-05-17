/** Simulated admin sub-roles until backend provides claims. sessionStorage key: tairalsaad_admin_role */

export type AdminSubRole = "super_admin" | "support_admin" | "finance_admin" | "read_only";

const STORAGE_KEY = "tairalsaad_admin_role";

export function getAdminSubRole(): AdminSubRole {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY) as AdminSubRole | null;
    if (v && ["super_admin", "support_admin", "finance_admin", "read_only"].includes(v)) return v;
  } catch {
    /* ignore */
  }
  return "super_admin";
}

export function setAdminSubRole(role: AdminSubRole): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, role);
  } catch {
    /* ignore */
  }
}

export type AdminPageKey =
  | "overview"
  | "users"
  | "drivers"
  | "orders"
  | "payments"
  | "disputes"
  | "reviews"
  | "analytics"
  | "promotions"
  | "serviceAreas"
  | "pricing"
  | "notifications"
  | "audit"
  | "settings"
  | "support"
  | "roles";

const PAGE_ROLES: Record<AdminPageKey, AdminSubRole[]> = {
  overview: ["super_admin", "support_admin", "finance_admin", "read_only"],
  users: ["super_admin", "support_admin", "read_only"],
  drivers: ["super_admin", "support_admin", "read_only"],
  orders: ["super_admin", "support_admin", "read_only"],
  payments: ["super_admin", "finance_admin", "read_only"],
  disputes: ["super_admin", "support_admin", "read_only"],
  reviews: ["super_admin", "support_admin", "read_only"],
  analytics: ["super_admin", "read_only"],
  promotions: ["super_admin", "support_admin", "read_only"],
  serviceAreas: ["super_admin", "read_only"],
  pricing: ["super_admin", "read_only"],
  notifications: ["super_admin", "support_admin", "read_only"],
  audit: ["super_admin", "read_only"],
  settings: ["super_admin", "read_only"],
  support: ["super_admin", "support_admin", "read_only"],
  roles: ["super_admin", "read_only"],
};

export function canAccessPage(page: AdminPageKey, role: AdminSubRole = getAdminSubRole()): boolean {
  return PAGE_ROLES[page].includes(role);
}
