import { Check } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export type StepperStep = { id: string; label: string; description?: string };

export type StepperProps = {
  steps: StepperStep[];
  currentIndex: number;
  className?: string;
};

export function Stepper({ steps, currentIndex, className }: StepperProps) {
  return (
    <ol className={cn("flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-0", className)}>
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={step.id} className="flex flex-1 items-start gap-3 md:flex-col md:items-center md:text-center">
            <div className="flex w-full items-center gap-3 md:flex-col md:gap-2">
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && !done && "border-primary text-primary",
                  !active && !done && "border-muted-foreground/30 text-muted-foreground",
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              {i < steps.length - 1 ? (
                <div className="hidden h-0.5 flex-1 bg-border md:mx-auto md:mt-2 md:h-8 md:w-0.5 md:flex-none" aria-hidden />
              ) : null}
            </div>
            <div className="min-w-0 pb-4 md:px-2">
              <p className={cn("text-sm font-medium", active && "text-primary")}>{step.label}</p>
              {step.description ? <p className="text-xs text-muted-foreground">{step.description}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
