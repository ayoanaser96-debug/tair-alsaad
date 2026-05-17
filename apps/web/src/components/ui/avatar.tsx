import * as React from "react";

import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

const sizes = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
} as const;

export type AvatarProps = React.HTMLAttributes<HTMLDivElement> & {
  src?: string | null;
  alt?: string;
  name: string;
  size?: keyof typeof sizes;
  status?: "online" | "offline" | "busy";
};

export function Avatar({ className, src, alt = "", name, size = "md", status, ...props }: AvatarProps) {
  const dot =
    status === "online"
      ? "bg-emerald-500"
      : status === "busy"
        ? "bg-amber-500"
        : status === "offline"
          ? "bg-muted-foreground"
          : null;

  return (
    <div className={cn("relative inline-flex shrink-0", className)} {...props}>
      {src ? (
        <img src={src} alt={alt || name} className={cn("rounded-full object-cover", sizes[size])} />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary",
            sizes[size],
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {dot ? (
        <span
          className={cn("absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-card", dot)}
          aria-label={status}
        />
      ) : null}
    </div>
  );
}
