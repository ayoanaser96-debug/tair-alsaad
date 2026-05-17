import { ChevronRight, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useActiveDelivery } from "@/pages/driver/DriverDeliveryContext";

export function DriverStickyDeliveryBar() {
  const { t, i18n } = useTranslation();
  const { delivery } = useActiveDelivery();
  const isRtl = i18n.dir() === "rtl";
  if (!delivery) return null;

  return (
    <div className="sticky top-0 z-30 -mx-4 mb-4 border-b border-primary/20 bg-gradient-to-r from-[#2563eb]/10 to-sky-100/80 px-4 py-3 shadow-sm backdrop-blur-sm md:-mx-8 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2563eb]/15 text-[#2563eb]">
            <Package className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-[#2563eb]">{t("driver.dashboard.sticky.onDelivery")}</p>
            <p className="truncate font-mono text-sm font-semibold">{delivery.trackingCode}</p>
            <p className="truncate text-xs text-muted-foreground">
              {t("driver.dashboard.sticky.routeFromTo", { pickup: delivery.pickupLabel, drop: delivery.dropLabel })}
            </p>
          </div>
        </div>
        <Button size="sm" className="shrink-0 bg-[#2563eb] hover:bg-[#2563eb]/90" asChild>
          <Link to="/dashboard/driver?tab=active" className="inline-flex items-center gap-1">
            {t("driver.dashboard.sticky.details")}
            <ChevronRight className={cn("h-4 w-4", isRtl && "scale-x-[-1]")} />
          </Link>
        </Button>
      </div>
    </div>
  );
}
