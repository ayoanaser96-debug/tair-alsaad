import * as React from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export type PriceDisplayProps = {
  amount: number;
  currency?: string;
  className?: string;
  breakdown?: { label: string; amount: number }[];
};

export function PriceDisplay({ amount, currency = "MYR", className, breakdown }: PriceDisplayProps) {
  const main = formatCurrency(amount, currency);
  if (!breakdown?.length) {
    return <span className={cn("tabular-nums font-semibold", className)}>{main}</span>;
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className={cn("tabular-nums font-semibold underline decoration-dotted underline-offset-4", className)}>
          {main}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <ul className="space-y-1 text-xs">
          {breakdown.map((row) => (
            <li key={row.label} className="flex justify-between gap-4">
              <span>{row.label}</span>
              <span>{formatCurrency(row.amount, currency)}</span>
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}
