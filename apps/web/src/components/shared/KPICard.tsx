import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type KPICardProps = {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  sublabel?: string;
  className?: string;
} & (
  | {
      trendPct?: undefined;
      vsPreviousLabel?: undefined;
    }
  | {
      trendPct: number;
      vsPreviousLabel: string;
    }
);

export function KPICard({ label, value, icon, trendPct, vsPreviousLabel, sublabel, className }: KPICardProps) {
  const up = trendPct !== undefined && trendPct > 0;
  const down = trendPct !== undefined && trendPct < 0;
  return (
    <Card className={cn("border-border/80 shadow-md", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
        {icon ? <span className="text-primary">{icon}</span> : null}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {trendPct !== undefined && vsPreviousLabel !== undefined ? (
          <p
            className={cn(
              "mt-1 inline-flex items-center gap-0.5 text-xs",
              trendPct === 0 && "text-muted-foreground",
              up && "text-emerald-600",
              down && "text-red-600",
            )}
          >
            {trendPct !== 0 ? up ? <ArrowUpRight className="h-3 w-3" aria-hidden /> : <ArrowDownRight className="h-3 w-3" aria-hidden /> : null}
            {trendPct > 0 ? "+" : ""}
            {trendPct}% {vsPreviousLabel}
          </p>
        ) : sublabel ? (
          <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
