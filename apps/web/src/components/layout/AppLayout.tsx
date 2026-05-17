import * as React from "react";
import { Outlet } from "react-router-dom";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

import { Sidebar, type SidebarProps } from "./Sidebar";
import { Topbar } from "./Topbar";
import { cn } from "@/lib/utils";

export type AppLayoutProps = SidebarProps & {
  /** Shown on md+ next to main (e.g. sender NotificationBell) */
  mainTopBar?: React.ReactNode;
  children?: React.ReactNode;
  contentClassName?: string;
};

export function AppLayout({ brand, nav, user, onSignOut, footer, mainTopBar, children, contentClassName }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const sidebarBody = (
    <Sidebar brand={brand} nav={nav} user={user} onSignOut={onSignOut} footer={footer} />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-background to-[hsl(35_38%_92%)] dark:from-background dark:via-background dark:to-background">
      <div className="flex min-h-screen">
        <div className="hidden md:block">{sidebarBody}</div>

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            start={
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex w-72 flex-col overflow-y-auto p-4">
                  <Sidebar brand={brand} nav={nav} user={user} onSignOut={onSignOut} footer={footer} />
                </SheetContent>
              </Sheet>
            }
            center={brand?.title}
          />

          {mainTopBar ? <div className="mb-4 hidden justify-end md:flex">{mainTopBar}</div> : null}

          <main className={cn("flex-1 p-4 md:p-8", contentClassName)}>{children ?? <Outlet />}</main>
        </div>
      </div>
    </div>
  );
}
