import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const sizes = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-8 w-8" } as const;

export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: keyof typeof sizes;
}

export function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  return <Loader2 className={cn("animate-spin text-primary", sizes[size], className)} aria-hidden {...props} />;
}
