import { DollarSign, History, LayoutDashboard, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function tabFromSearch(search: string): string {
  return new URLSearchParams(search).get("tab") ?? "available";
}

export function DriverMobileNav() {
  const { t } = useTranslation();
  const { pathname, search } = useLocation();
  const tab = tabFromSearch(search);
  const home = pathname === "/dashboard/driver";

  const nav = [
    {
      to: "/dashboard/driver",
      label: t("driver.dashboard.mobile.home"),
      icon: LayoutDashboard,
      active: home && (tab === "available" || !search.includes("tab=")),
    },
    {
      to: "/dashboard/driver?tab=active",
      label: t("driver.dashboard.mobile.active"),
      icon: Truck,
      active: home && tab === "active",
    },
    {
      to: "/dashboard/driver?tab=history",
      label: t("driver.dashboard.mobile.history"),
      icon: History,
      active: home && tab === "history",
    },
    {
      to: "/dashboard/driver?tab=earnings",
      label: t("driver.dashboard.mobile.earn"),
      icon: DollarSign,
      active: home && tab === "earnings",
    },
  ];

  return (
    <nav className="fixed bottom-0 start-0 end-0 z-40 flex border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden">
      {nav.map(({ to, label, icon: Icon, active }) => (
        <Link
          key={to + label}
          to={to}
          className={cn(
            "flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors",
            active ? "text-[#2563eb]" : "text-muted-foreground",
          )}
        >
          <Icon className={cn("h-6 w-6", active && "text-[#2563eb]")} />
          <span className="truncate">{label}</span>
        </Link>
      ))}
      <Sheet>
        <SheetTrigger asChild>
          <button
            type="button"
            className="flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium text-muted-foreground"
          >
            <span className="text-lg leading-none">⋯</span>
            {t("driver.dashboard.mobile.more")}
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto max-h-[85vh] overflow-y-auto rounded-t-2xl pb-8">
          <p className="mb-3 text-sm font-semibold">{t("driver.dashboard.mobile.sheetTitle")}</p>
          <div className="grid gap-2">
            <Button variant="outline" className="h-12 justify-start text-base" asChild>
              <Link to="/dashboard/driver/vehicle">{t("driver.dashboard.mobile.vehicleDocs")}</Link>
            </Button>
            <Button variant="outline" className="h-12 justify-start text-base" asChild>
              <Link to="/dashboard/driver/ratings">{t("driver.dashboard.mobile.ratingsReviews")}</Link>
            </Button>
            <Button variant="outline" className="h-12 justify-start text-base" asChild>
              <Link to="/dashboard/driver/support">{t("driver.dashboard.mobile.support")}</Link>
            </Button>
            <Button variant="outline" className="h-12 justify-start text-base" asChild>
              <Link to="/dashboard/driver/settings">{t("driver.dashboard.mobile.settings")}</Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
