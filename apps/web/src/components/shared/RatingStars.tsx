import { Star } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export type RatingStarsProps = {
  value: number;
  max?: number;
  /** When set, renders interactive buttons */
  onChange?: (n: number) => void;
  className?: string;
  size?: "sm" | "md";
};

export function RatingStars({ value, max = 5, onChange, className, size = "md" }: RatingStarsProps) {
  const starClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div className={cn("inline-flex items-center gap-0.5", className)} role={onChange ? "radiogroup" : undefined}>
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const fill = value >= n;
        const star = <Star className={cn(starClass, fill ? "fill-amber-400 text-amber-500" : "text-muted-foreground/40")} />;
        if (onChange) {
          return (
            <button
              key={n}
              type="button"
              className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => onChange(n)}
              aria-label={`Rate ${n} out of ${max}`}
            >
              {star}
            </button>
          );
        }
        return (
          <span key={n}>
            {star}
          </span>
        );
      })}
    </div>
  );
}
