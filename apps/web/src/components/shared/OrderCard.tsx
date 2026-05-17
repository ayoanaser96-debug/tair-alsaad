import { ChevronRight } from "lucide-react";
import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

import { OrderStatusBadge } from "./OrderStatusBadge";

export type OrderCardProps = {
  trackingCode: string;
  pickupLabel: string;
  dropLabel: string;
  status: string;
  amount: number;
  currency?: string;
  at: Date | string;
  onClick?: () => void;
  className?: string;
};

export function OrderCard({
  trackingCode,
  pickupLabel,
  dropLabel,
  status,
  amount,
  currency = "MYR",
  at,
  onClick,
  className,
}: OrderCardProps) {
  return (
    <Card
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        "border-border/80 shadow-md transition-shadow",
        onClick && "cursor-pointer hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold">{trackingCode}</span>
            <OrderStatusBadge status={status} size="sm" />
          </div>
          <p className="truncate text-sm text-muted-foreground" title={`${pickupLabel} → ${dropLabel}`}>
            {pickupLabel} → {dropLabel}
          </p>
          <p className="text-xs text-muted-foreground">{formatDate(at, "datetime")}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="font-semibold tabular-nums">{formatCurrency(amount, currency)}</span>
          {onClick ? <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden /> : null}
        </div>
      </CardContent>
    </Card>
  );
}
