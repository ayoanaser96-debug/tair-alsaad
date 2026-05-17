import * as React from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import { normalizeOrderStatus, type OrderStatusUi } from "./OrderStatusBadge";

const FLOW: OrderStatusUi[] = ["pending", "assigned", "picked_up", "in_transit", "delivered"];

export type OrderTimelineProps = {
  status: string;
  /** ISO strings for steps that have occurred */
  timestamps?: Partial<Record<OrderStatusUi, string | undefined>>;
  className?: string;
};

export function OrderTimeline({ status, timestamps, className }: OrderTimelineProps) {
  const { t } = useTranslation();
  const current = normalizeOrderStatus(status);
  const currentIdx =
    current === "cancelled" || current === "disputed" || current === "draft"
      ? -1
      : FLOW.indexOf(current === "pending" ? "pending" : current);

  return (
    <div className={cn("space-y-4", className)}>
      {current === "cancelled" ? (
        <p className="text-sm font-medium text-destructive">{t("orderTimeline.cancelled")}</p>
      ) : null}
      {current === "disputed" ? (
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">{t("orderTimeline.disputeOpen")}</p>
      ) : null}
      <ol className="relative space-y-0 border-s-2 border-primary/25 ps-6">
        {FLOW.map((step, i) => {
          const done = currentIdx >= i;
          const active = currentIdx === i;
          const ts = timestamps?.[step];
          return (
            <li key={step} className="pb-6 last:pb-0">
              <span
                className={cn(
                  "absolute -start-[9px] mt-1.5 h-4 w-4 rounded-full border-2 bg-card",
                  done ? "border-primary bg-primary" : "border-muted-foreground/40",
                  active && "ring-2 ring-primary ring-offset-2",
                )}
              />
              <p className={cn("text-sm font-medium", done ? "text-foreground" : "text-muted-foreground")}>
                {t(`orderStatus.${step}`)}
              </p>
              {ts ? <p className="text-xs text-muted-foreground">{new Date(ts).toLocaleString()}</p> : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
