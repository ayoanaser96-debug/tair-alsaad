import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { TrackingMap } from "@/components/shared/TrackingMap";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { DriverLocationEvt } from "@/lib/realtime/usePublicShipmentRealtime";
import { usePublicShipmentRealtime } from "@/lib/realtime/usePublicShipmentRealtime";
import { fetchPublicTracking, type PublicTrackingPayload } from "@/lib/api/track";

export default function PublicTrackPage() {
  const { trackingCode } = useParams<{ trackingCode: string }>();

  const [data, setData] = useState<PublicTrackingPayload | null>(null);
  const [errorText, setErrorText] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [driverSpot, setDriverSpot] = useState<{ lat: number; lng: number }>();

  const load = useCallback(async () => {
    if (!trackingCode?.trim()) {
      setErrorText("Missing tracking code.");
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
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : "Tracking failed.");
    } finally {
      setLoading(false);
    }
  }, [trackingCode]);

  useEffect(() => {
    void load();
  }, [load]);

  const onDriverEvt = useCallback((p: DriverLocationEvt) => {
    if (!data?.shipmentId || !p?.shipmentId || p.shipmentId !== data.shipmentId) return;
    setDriverSpot({ lat: p.lat, lng: p.lng });
  }, [data?.shipmentId]);

  usePublicShipmentRealtime(trackingCode, load, onDriverEvt);

  if (!trackingCode?.trim()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-background px-4 py-10">
        <p className="text-center text-muted-foreground">Tracking code missing</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-background to-[hsl(35_38%_92%)]">
      <header className="border-b bg-card/95 px-4 py-6 shadow-sm backdrop-blur">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Live tracking</h1>
        <p className="text-sm text-muted-foreground">{trackingCode.trim().toUpperCase()}</p>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
        {loading ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden /> Loading…
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
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-2xl font-semibold capitalize text-foreground">{data.status}</p>
              {typeof data.etaMinutes === "number" ? (
                <p className="mt-2 text-sm text-muted-foreground">ETA ~ {data.etaMinutes} minutes</p>
              ) : null}
            </section>

            <TrackingMap
              pickupLabel={[data.pickupCity, data.pickupLocation ? "✓ pinned" : ""].filter(Boolean).join(" • ")}
              dropLabel={[data.dropoffCity, data.dropoffLocation ? "✓ pinned" : ""].filter(Boolean).join(" • ")}
              driverLabel={
                driverSpot ? `${driverSpot.lat.toFixed(4)}, ${driverSpot.lng.toFixed(4)}` : "Driver location pending"
              }
              pickupCoords={data.pickupLocation ?? undefined}
              dropCoords={data.dropoffLocation ?? undefined}
              driverCoords={driverSpot}
            />

            <section className="rounded-xl border bg-card p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Updates</h2>
              <ul className="space-y-2 text-sm">
                {(data.statusHistory ?? []).slice(0, 12).map((row, idx) => (
                  <li key={`${idx}-${String(row.at)}-${row.status}`} className="flex justify-between gap-4">
                    <span className="font-medium capitalize text-foreground">{row.status}</span>
                    <span className="text-muted-foreground">
                      {row.at instanceof Date ? row.at.toISOString() : String(row.at)}
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
