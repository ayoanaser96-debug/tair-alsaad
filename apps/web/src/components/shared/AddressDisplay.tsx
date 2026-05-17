import { MapPin } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export type AddressDisplayProps = {
  line: string;
  secondary?: string;
  showIcon?: boolean;
  className?: string;
};

export function AddressDisplay({ line, secondary, showIcon = true, className }: AddressDisplayProps) {
  return (
    <div className={cn("flex gap-2 text-sm", className)}>
      {showIcon ? <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /> : null}
      <div className="min-w-0">
        <p className="leading-snug">{line}</p>
        {secondary ? <p className="text-muted-foreground">{secondary}</p> : null}
      </div>
    </div>
  );
}
