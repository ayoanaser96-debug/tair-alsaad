import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Loader2,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import i18n from "@/i18n/config";
import { cn } from "@/lib/utils";

/** Canonical lowercase statuses for UI */
export type OrderStatusUi =
  | "pending"
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled"
  | "disputed"
  | "draft";

const VARIANT: Record<OrderStatusUi, React.ComponentProps<typeof Badge>["variant"]> = {
  draft: "neutral",
  pending: "neutral",
  assigned: "warning",
  picked_up: "info",
  in_transit: "info",
  delivered: "success",
  cancelled: "danger",
  disputed: "warning",
};

const ICON: Record<OrderStatusUi, React.ReactNode> = {
  draft: <CircleDashed className="h-3 w-3" />,
  pending: <Loader2 className="h-3 w-3" />,
  assigned: <Truck className="h-3 w-3" />,
  picked_up: <Package className="h-3 w-3" />,
  in_transit: <Truck className="h-3 w-3" />,
  delivered: <CheckCircle2 className="h-3 w-3" />,
  cancelled: <XCircle className="h-3 w-3" />,
  disputed: <AlertTriangle className="h-3 w-3" />,
};

/** Normalize API / mixed-case strings to UI status */
export function normalizeOrderStatus(raw: string): OrderStatusUi {
  const u = raw.trim().toUpperCase().replace(/-/g, "_");
  switch (u) {
    case "DRAFT":
      return "draft";
    case "PENDING":
      return "pending";
    case "ASSIGNED":
      return "assigned";
    case "PICKED_UP":
      return "picked_up";
    case "IN_TRANSIT":
      return "in_transit";
    case "DELIVERED":
      return "delivered";
    case "CANCELLED":
      return "cancelled";
    case "DISPUTED":
      return "disputed";
    default:
      return "pending";
  }
}

export function orderStatusLabel(status: OrderStatusUi): string {
  return i18n.t(`orderStatus.${status}`);
}

export type OrderStatusBadgeProps = {
  /** API status (e.g. PENDING) or normalized UI status */
  status: string;
  className?: string;
  size?: "sm" | "md";
};

export function OrderStatusBadge({ status, className, size = "md" }: OrderStatusBadgeProps) {
  const { t } = useTranslation();
  const ui = normalizeOrderStatus(status);
  return (
    <Badge variant={VARIANT[ui]} size={size} icon={ICON[ui]} className={cn(className)}>
      {t(`orderStatus.${ui}`)}
    </Badge>
  );
}
