import * as React from "react";

import { EmptyState } from "@/components/layout/EmptyState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ChartCardProps = {
  title: string;
  description?: string;
  filter?: React.ReactNode;
  legend?: React.ReactNode;
  empty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function ChartCard({
  title,
  description,
  filter,
  legend,
  empty,
  emptyMessage = "No data for this range",
  children,
  className,
  contentClassName,
}: ChartCardProps) {
  return (
    <Card className={cn("border-border/80 shadow-md", className)}>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {filter}
      </CardHeader>
      <CardContent className={cn(contentClassName)}>
        {empty ? (
          <EmptyState title={emptyMessage} description="Try another date range or check back later." />
        ) : (
          children
        )}
        {legend && !empty ? <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">{legend}</div> : null}
      </CardContent>
    </Card>
  );
}
