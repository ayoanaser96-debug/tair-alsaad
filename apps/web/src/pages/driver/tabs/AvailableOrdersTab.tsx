import { Clock, Map, MapPin, Navigation, Package, Star, User } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAcceptOrderMutation, useDeclineOrderMutation } from "@/features/drivers/hooks";
import { useAvailableOrders } from "@/hooks/driver/useAvailableOrders";
import i18n from "@/i18n/config";
import { formatAppCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useActiveDelivery } from "@/pages/driver/DriverDeliveryContext";
import type { AvailableOffer } from "@/pages/driver/driverMock";

import { OfferCountdown } from "./OfferCountdown";

export function AvailableOrdersTab({ online }: { online: boolean }) {
  const { t, i18n } = useTranslation();
  const { offers, loading, lastUpdated, error } = useAvailableOrders(online);
  const acceptMutation = useAcceptOrderMutation();
  const declineMutation = useDeclineOrderMutation();
  const { delivery, startFromOffer } = useActiveDelivery();
  const [mapView, setMapView] = useState(false);

  const timeLocale = i18n.language.toLowerCase().startsWith("ar") ? "ar-IQ" : "en-IQ";

  async function accept(o: AvailableOffer) {
    if (delivery) {
      toast.error(i18n.t("toasts.finishDeliveryFirst"));
      return;
    }
    try {
      await acceptMutation.mutateAsync(o.id);
      toast.success(i18n.t("toasts.offerAccepted"));
      startFromOffer(o);
    } catch {
      /* toast in mutation; offline until backend adds POST .../accept */
    }
  }

  async function decline(id: string) {
    try {
      await declineMutation.mutateAsync(id);
    } catch {
      /* declined only when API exists */
    }
  }

  if (!online) {
    return (
      <Card className="border-dashed border-amber-200 bg-amber-50/50 shadow-sm">
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="font-medium text-amber-900">{t("driver.dashboard.available.offlineTitle")}</p>
          <p className="max-w-sm text-sm text-muted-foreground">{t("driver.dashboard.available.offlineBody")}</p>
        </CardContent>
      </Card>
    );
  }

  const statusLine = loading
    ? t("driver.dashboard.available.refreshing")
    : lastUpdated
      ? t("driver.dashboard.available.updatedAt", {
          time: lastUpdated.toLocaleTimeString(timeLocale, { timeStyle: "short", numberingSystem: "latn" }),
        })
      : t("driver.dashboard.available.nearbyRequests");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {statusLine}
          {error ? (
            <span className="ms-2 text-destructive">
              ({t("driver.dashboard.available.errorPrefix")}: {error})
            </span>
          ) : null}
        </p>
        <Button
          type="button"
          variant={mapView ? "default" : "outline"}
          size="sm"
          className={cn(mapView && "bg-[#2563eb] hover:bg-[#2563eb]/90")}
          onClick={() => setMapView((v) => !v)}
        >
          <Map className="h-4 w-4" />
          {mapView ? t("driver.dashboard.available.listView") : t("driver.dashboard.available.mapView")}
        </Button>
      </div>

      {mapView ? (
        <Card className="overflow-hidden border-dashed shadow-sm">
          <CardContent className="flex h-64 flex-col items-center justify-center gap-2 bg-gradient-to-br from-sky-100/80 to-primary/5 p-6 text-center">
            <MapPin className="h-10 w-10 text-primary" />
            <p className="font-medium">{t("driver.dashboard.available.mapTitle")}</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              {t("driver.dashboard.available.mapBody", { count: offers.length })}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className={cn("grid gap-4", mapView ? "sm:grid-cols-1" : "sm:grid-cols-2")}>
        {offers.length === 0 ? (
          <Card className="border-border/80 shadow-sm sm:col-span-2">
            <CardContent className="py-12 text-center text-muted-foreground">{t("driver.dashboard.available.empty")}</CardContent>
          </Card>
        ) : (
          offers.map((o) => {
            const packageTypeLabel = t(`driver.activeDelivery.packageTypes.${o.packageType}`, {
              defaultValue: o.packageType,
            });
            const earningsFmt = formatAppCurrency(o.estimatedEarnings, i18n.language);
            return (
              <Card key={o.id} className="border-border/80 shadow-md transition-shadow hover:shadow-lg">
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono">
                        {packageTypeLabel}
                      </Badge>
                      <span className="flex items-center gap-0.5 text-xs text-amber-700">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                        {t("driver.dashboard.available.senderRating", { rating: o.senderRating.toFixed(1) })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{t("driver.dashboard.available.acceptIn")}</span>
                      <OfferCountdown expiresAt={o.expiresAt} />
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <Navigation className={cn("mt-0.5 h-4 w-4 shrink-0 text-[#2563eb]", i18n.dir() === "rtl" && "scale-x-[-1]")} />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">{t("driver.activeDelivery.pickup")}</p>
                        <p>{o.pickupLabel}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">{t("driver.activeDelivery.dropoff")}</p>
                        <p>{o.dropLabel}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 border-t border-border pt-3 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Package className="h-4 w-4" />
                      {t("driver.dashboard.available.distanceKm", { distance: o.distanceKm.toFixed(1) })}
                    </span>
                    <span className="font-medium text-emerald-700">~{earningsFmt}</span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {t("driver.dashboard.available.eta", { minutes: o.etaMinutes })}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-4 w-4" />
                      {o.senderName}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      size="sm"
                      className="bg-[#2563eb] hover:bg-[#2563eb]/90"
                      disabled={acceptMutation.isPending}
                      onClick={() => void accept(o)}
                    >
                      {t("driver.dashboard.available.accept")}
                    </Button>
                    <Button size="sm" variant="outline" disabled={declineMutation.isPending} onClick={() => void decline(o.id)}>
                      {t("driver.dashboard.available.decline")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
