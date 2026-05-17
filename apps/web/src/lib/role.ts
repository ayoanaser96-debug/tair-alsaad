/**
 * Normalize API/user role strings to dashboard role enums (uppercase).
 * Backend uses lowercase; some clients may send legacy uppercase.
 */
export type DashboardRole = "SENDER" | "DRIVER" | "ADMIN";

export function toDashboardRole(role: string | undefined | null): DashboardRole {
  const raw = String(role ?? "").toLowerCase();
  if (raw === "admin") return "ADMIN";
  if (raw === "driver") return "DRIVER";
  return "SENDER";
}

export function isSenderRole(role: string | undefined | null): boolean {
  return toDashboardRole(role) === "SENDER";
}

export function isDriverRole(role: string | undefined | null): boolean {
  return toDashboardRole(role) === "DRIVER";
}

export function isAdminRole(role: string | undefined | null): boolean {
  return toDashboardRole(role) === "ADMIN";
}
