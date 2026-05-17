import { LogOut } from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type SidebarNavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
};

export type SidebarProps = {
  brand?: { title: string; to: string; logo: React.ReactNode };
  nav: React.ReactNode;
  user?: { name: string; contact: string; roleLabel: string };
  onSignOut: () => void;
  footer?: React.ReactNode;
  className?: string;
};

export function Sidebar({ brand, nav, user, onSignOut, footer, className }: SidebarProps) {
  return (
    <aside className={cn("flex w-64 flex-col border-r border-border bg-card/90 p-4 shadow-sm", className)}>
      <div className="flex min-h-0 flex-1 flex-col">
        {brand ? (
          <Link to={brand.to} className="mb-6 flex items-center gap-2 font-semibold text-foreground">
            {brand.logo}
            {brand.title}
          </Link>
        ) : null}
        {user ? (
          <div className="space-y-3 rounded-lg border border-secondary/60 bg-secondary/30 p-3 text-sm">
            <p className="font-medium leading-tight">{user.name}</p>
            <p className="text-muted-foreground">{user.contact}</p>
            <Badge variant="secondary" className="capitalize">
              {user.roleLabel}
            </Badge>
          </div>
        ) : null}
        <Separator className="my-4" />
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">{nav}</nav>
        <Separator className="my-4" />
        <Button variant="secondary" className="w-full justify-start gap-2" type="button" onClick={onSignOut}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
        {footer}
      </div>
    </aside>
  );
}
