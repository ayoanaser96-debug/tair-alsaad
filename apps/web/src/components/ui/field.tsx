import * as React from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type FieldProps = {
  id?: string;
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function Field({ id, label, helperText, error, required, className, children }: FieldProps) {
  const errId = error ? `${id ?? "field"}-error` : undefined;
  const helpId = helperText ? `${id ?? "field"}-help` : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <Label htmlFor={id} className={error ? "text-destructive" : undefined}>
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </Label>
      ) : null}
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>, {
            id,
            "aria-invalid": !!error || undefined,
            "aria-describedby": [errId, helpId].filter(Boolean).join(" ") || undefined,
          })
        : children}
      {helperText && !error ? (
        <p id={helpId} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p id={errId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
