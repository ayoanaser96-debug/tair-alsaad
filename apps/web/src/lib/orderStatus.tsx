/**
 * Backward-compatible re-exports — prefer `OrderStatusBadge` from `@/components`.
 */
import { normalizeOrderStatus, orderStatusLabel } from "@/components/shared/OrderStatusBadge";

export {
  normalizeOrderStatus,
  OrderStatusBadge,
  orderStatusLabel,
  type OrderStatusUi,
} from "@/components/shared/OrderStatusBadge";

export { OrderStatusBadge as StatusBadge } from "@/components/shared/OrderStatusBadge";

export const ORDER_STATUSES = [
  "DRAFT",
  "PENDING",
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

/** @deprecated Prefer orderStatusLabel(normalizeOrderStatus(s)) */
export function statusLabel(status: string): string {
  return orderStatusLabel(normalizeOrderStatus(status));
}

export function statusBadgeClass(status: string): string {
  const u = status.toUpperCase();
  switch (u) {
    case "DELIVERED":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-800";
    case "IN_TRANSIT":
    case "PICKED_UP":
      return "border-blue-200 bg-blue-50 text-blue-800";
    case "ASSIGNED":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "PENDING":
      return "border-slate-200 bg-slate-100 text-slate-800";
    case "DRAFT":
      return "border-violet-200 bg-violet-50 text-violet-800";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}
