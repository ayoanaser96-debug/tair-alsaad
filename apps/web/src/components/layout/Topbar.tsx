import * as React from "react";

import { cn } from "@/lib/utils";

export type TopbarProps = {
  /** Mobile menu trigger */
  start?: React.ReactNode;
  /** Brand / title */
  center?: React.ReactNode;
  /** Search, notifications, theme, user menu */
  end?: React.ReactNode;
  className?: string;
};

export function Topbar({ start, center, end, className }: TopbarProps) {
  return (
    <header className={cn("flex items-center justify-between gap-2 border-b border-border bg-card/80 px-4 py-3 md:hidden", className)}>
      <div className="flex items-center gap-2">{start}</div>
      {center ? <span className="font-semibold">{center}</span> : <span />}
      <div className="flex items-center gap-2">{end}</div>
    </header>
  );
}
