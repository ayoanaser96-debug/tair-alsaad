import { MapPin } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export type LatLng = { lat: number; lng: number };

export type TrackingMapProps = {
  pickupLabel: string;
  dropLabel: string;
  pickupCoords?: LatLng;
  dropCoords?: LatLng;
  driverCoords?: LatLng | null;
  driverLabel?: string;
  className?: string;
};

function paddedBounds(coords: LatLng[], pad = 0.02): { minLng: number; minLat: number; maxLng: number; maxLat: number } {
  const lngs = coords.map((c) => c.lng);
  const lats = coords.map((c) => c.lat);
  let minLng = Math.min(...lngs);
  let maxLng = Math.max(...lngs);
  let minLat = Math.min(...lats);
  let maxLat = Math.max(...lats);

  minLng -= pad;
  maxLng += pad;
  minLat -= pad;
  maxLat += pad;

  if (minLng === maxLng || minLat === maxLat) {
    minLng -= pad;
    maxLng += pad;
    minLat -= pad;
    maxLat += pad;
  }

  return { minLng, minLat, maxLng, maxLat };
}

/** OpenStreetMap embed (no tiles API key needed). Shows driver/pickup/drop bbox when coords exist. */
export function TrackingMap({
  pickupLabel,
  dropLabel,
  pickupCoords,
  dropCoords,
  driverCoords,
  driverLabel,
  className,
}: TrackingMapProps) {
  const frameSrc = React.useMemo(() => {
    const pts: LatLng[] = [];
    if (pickupCoords) pts.push(pickupCoords);
    if (dropCoords) pts.push(dropCoords);
    if (driverCoords) pts.push(driverCoords);
    if (pts.length === 0) return null;
    const b = paddedBounds(pts, 0.03);
    const bbox = `${b.minLng},${b.minLat},${b.maxLng},${b.maxLat}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik`;
  }, [pickupCoords, dropCoords, driverCoords]);

  return (
    <div className={cn("space-y-3", className)}>
      {frameSrc ? (
        <iframe
          title="Live shipment map"
          className="h-[320px] w-full rounded-xl border bg-muted shadow-sm"
          sandbox="allow-scripts allow-same-origin"
          referrerPolicy="no-referrer-when-downgrade"
          loading="lazy"
          src={frameSrc}
        />
      ) : (
        <div
          className={cn(
            "relative flex aspect-[16/10] w-full flex-col justify-between overflow-hidden rounded-xl border bg-muted/40 p-4 text-sm",
          )}
          role="img"
          aria-label={`Map preview from ${pickupLabel} to ${dropLabel}`}
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--primary)/0.08)_0%,transparent_40%,hsl(var(--primary)/0.06)_100%)]" />
          <div className="relative z-[1] flex flex-1 flex-col justify-between">
            <div className="flex items-start gap-2 rounded-lg border bg-card/95 px-3 py-2 shadow-sm">
              <MapPin className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Pickup</p>
                <p className="leading-snug">{pickupLabel}</p>
              </div>
            </div>
            <div className="mx-auto flex flex-col items-center gap-1 py-2">
              <div className="h-12 w-px bg-primary/40" />
              {driverLabel ? (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">{driverLabel}</span>
              ) : null}
              <div className="h-12 w-px bg-primary/40" />
            </div>
            <div className="flex items-start gap-2 rounded-lg border bg-card/95 px-3 py-2 shadow-sm">
              <MapPin className="mt-0.5 h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Drop-off</p>
                <p className="leading-snug">{dropLabel}</p>
              </div>
            </div>
          </div>
          <p className="relative z-[1] mt-2 text-center text-xs text-muted-foreground">Add coordinates server-side for full map preview</p>
        </div>
      )}

      <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        <div className="rounded-lg border bg-card px-3 py-2">
          <p className="font-semibold text-foreground text-sm">Pickup</p>
          <p>{pickupLabel}</p>
        </div>
        <div className="rounded-lg border bg-card px-3 py-2">
          <p className="font-semibold text-foreground text-sm">Drop-off</p>
          <p>{dropLabel}</p>
        </div>
        {driverCoords ? (
          <div className="rounded-lg border bg-primary/5 px-3 py-2 sm:col-span-2">
            <p className="font-semibold text-foreground text-sm">Driver pin</p>
            <p>
              {driverLabel ?? `${driverCoords.lat.toFixed(5)}, ${driverCoords.lng.toFixed(5)}`}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
