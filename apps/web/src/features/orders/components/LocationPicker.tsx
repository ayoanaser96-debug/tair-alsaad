import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type LatLng = { lat: number; lng: number };

interface LocationPickerProps {
  /** current pin position, null if not set yet */
  value: LatLng | null;
  onChange: (pos: LatLng) => void;
  /** map center when there is no pin yet (city center) */
  center: LatLng;
  zoom?: number;
  /** accessible label, localized, e.g. t("orders.create.pickupLocation") */
  ariaLabel: string;
  /** distinguishes pickup vs dropoff visually */
  markerColor?: string; // default primary blue
  className?: string;
}

/**
 * Tap/click to drop a pin; drag the pin to fine-tune.
 * Uses a divIcon so no marker image assets are needed (avoids the
 * classic Leaflet + bundler broken-icon problem).
 *
 * Default export so it can be React.lazy()-loaded on the create route only,
 * keeping Leaflet out of the main bundle.
 */
export default function LocationPicker({
  value,
  onChange,
  center,
  zoom = 13,
  ariaLabel,
  markerColor = "#2563eb",
  className,
}: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const makeIcon = () =>
    L.divIcon({
      className: "",
      html: `<div style="
        width:22px;height:22px;border-radius:50% 50% 50% 0;
        background:${markerColor};border:2px solid #fff;
        transform:rotate(-45deg);box-shadow:0 1px 4px rgba(0,0,0,.4);
      "></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 22],
    });

  const placeMarker = (pos: LatLng) => {
    const map = mapRef.current;
    if (!map) return;
    if (!markerRef.current) {
      markerRef.current = L.marker(pos, { draggable: true, icon: makeIcon() }).addTo(map);
      markerRef.current.on("dragend", () => {
        const p = markerRef.current!.getLatLng();
        onChangeRef.current({ lat: p.lat, lng: p.lng });
      });
    } else {
      markerRef.current.setLatLng(pos);
    }
  };

  // init once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: value ?? center,
      zoom,
      // keep zoom buttons clear of RTL layouts / form controls
      zoomControl: false,
    });
    L.control.zoom({ position: "bottomleft" }).addTo(map);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);
    map.on("click", (e: L.LeafletMouseEvent) => {
      const pos = { lat: e.latlng.lat, lng: e.latlng.lng };
      placeMarker(pos);
      onChangeRef.current(pos);
    });
    mapRef.current = map;
    if (value) placeMarker(value);
    // Leaflet needs a size recalculation once the container has laid out.
    setTimeout(() => map.invalidateSize(), 0);
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // recenter when the chosen city changes and no pin exists yet
  useEffect(() => {
    if (mapRef.current && !value) mapRef.current.setView(center, zoom);
  }, [center.lat, center.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  // keep marker in sync if parent resets the value (e.g. form reset)
  useEffect(() => {
    if (!mapRef.current) return;
    if (value) placeMarker(value);
    else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [value?.lat, value?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label={ariaLabel}
      // dir=ltr: Leaflet's internal panning/controls misbehave inside RTL containers
      dir="ltr"
      className={className}
      style={{ height: 280, width: "100%", borderRadius: 12, overflow: "hidden" }}
    />
  );
}
