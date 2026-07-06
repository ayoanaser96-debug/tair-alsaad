import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { formatDate } from "@tayralsaad/utils";

import { TrackingMap } from "@/components/shared/TrackingMap";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { DriverLocationEvt } from "@/lib/realtime/usePublicShipmentRealtime";
import { usePublicShipmentRealtime } from "@/lib/realtime/usePublicShipmentRealtime";
import { fetchPublicTracking, type PublicTrackingPayload } from "@/lib/api/track";

export default function PublicTrackPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.toLowerCase().startsWith("ar") ? "ar" : "en";
  const { trackingCode } = useParams<{ trackingCode: string }>();

  const [data, setData] = useState<PublicTrackingPayload | null>(null);
  const [errorText, setErrorText] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [driverSpot, setDriverSpot] = useState<{ lat: number; lng: number }>();

  const statusLabel = useCallback(
    (status: string) => t(`orderStatus.${String(status).toLowerCase()}`, { defaultValue: status }),
    [t],
  );

  const load = useCallback(async () => {
    if (!trackingCode?.trim()) {
      setErrorText(t("track.live.missingCode"));
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorText(undefined);
    try {
      const d = await fetchPublicTracking(trackingCode);
      setData(d);
      if (d.driverLocation?.lat !== undefined && d.driverLocation?.lng !== undefined) {
        setDriverSpot({ lat: d.driverLocation.lat, lng: d.driverLocation.lng });
      }
    } catch {
      setErrorText(t("track.live.notFound"));
    } finally {
      setLoading(false);
    }
  }, [trackingCode, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const onDriverEvt = useCallback(
    (p: DriverLocationEvt) => {
      if (!data?.shipmentId || !p?.shipmentId || p.shipmentId !== data.shipmentId) return;
      setDriverSpot({ lat: p.lat, lng: p.lng });
    },
    [data?.shipmentId],
  );

  usePublicShipmentRealtime(trackingCode, load, onDriverEvt);

  if (!trackingCode?.trim()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-background px-4 py-10">
        <p className="text-center text-muted-foreground">{t("track.live.missingCode")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-background to-[hsl(35_38%_92%)]">
      <header className="border-b bg-card/95 px-4 py-6 shadow-sm backdrop-blur">
        <h1 className="text-xl font-bold tracking-tight text-foreground">{t("track.live.title")}</h1>
        <p className="text-sm text-muted-foreground" dir="ltr">
          {trackingCode.trim().toUpperCase()}
        </p>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
        {loading ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden /> {t("track.live.loading")}
          </div>
        ) : null}
        {errorText ? (
          <Alert variant="destructive">
            <AlertDescription>{errorText}</AlertDescription>
          </Alert>
        ) : null}

        {data ? (
          <>
            <section className="rounded-2xl border bg-card p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">{t("track.live.status")}</p>
              <p className="text-2xl font-semibold text-foreground">{statusLabel(data.status)}</p>
              {typeof data.etaMinutes === "number" ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("track.live.etaMinutes", { minutes: data.etaMinutes })}
                </p>
              ) : null}
            </section>

            <TrackingMap
              pickupLabel={[data.pickupCity, data.pickupLocation ? `✓ ${t("track.map.pinned")}` : ""]
                .filter(Boolean)
                .join(" • ")}
              dropLabel={[data.dropoffCity, data.dropoffLocation ? `✓ ${t("track.map.pinned")}` : ""]
                .filter(Boolean)
                .join(" • ")}
              driverLabel={
                driverSpot ? `${driverSpot.lat.toFixed(4)}, ${driverSpot.lng.toFixed(4)}` : t("track.live.driverPending")
              }
              pickupCoords={data.pickupLocation ?? undefined}
              dropCoords={data.dropoffLocation ?? undefined}
              driverCoords={driverSpot}
            />

            <section className="rounded-xl border bg-card p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("track.live.updates")}
              </h2>
              <ul className="space-y-2 text-sm">
                {(data.statusHistory ?? []).slice(0, 12).map((row, idx) => (
                  <li key={`${idx}-${String(row.at)}-${row.status}`} className="flex justify-between gap-4">
                    <span className="font-medium text-foreground">{statusLabel(row.status)}</span>
                    <span className="text-muted-foreground" dir="ltr">
                      {formatDate(row.at, locale, { withTime: true })}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
