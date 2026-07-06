import type { LatLng } from "./components/LocationPicker";

/**
 * Map centers per city. KEYS MATCH the `key` values returned by GET /api/v1/cities
 * (verified against apps/api city seed: baghdad, basra, erbil, mosul, najaf,
 * karbala, sulaymaniyah, kirkuk). If the API starts serving more cities, add
 * their centers here; unknown keys fall back to DEFAULT_CENTER.
 */
export const CITY_CENTERS: Record<string, LatLng> = {
  baghdad: { lat: 33.3152, lng: 44.3661 },
  basra: { lat: 30.5085, lng: 47.7804 },
  erbil: { lat: 36.19, lng: 44.01 },
  mosul: { lat: 36.34, lng: 43.13 },
  najaf: { lat: 32.028, lng: 44.34 },
  karbala: { lat: 32.616, lng: 44.032 },
  sulaymaniyah: { lat: 35.561, lng: 45.435 },
  kirkuk: { lat: 35.4681, lng: 44.3922 },
};

export const DEFAULT_CENTER: LatLng = CITY_CENTERS.baghdad;

/** Resolve a city key to its map center, falling back to Baghdad. */
export function cityCenter(cityKey: string | null | undefined): LatLng {
  if (!cityKey) return DEFAULT_CENTER;
  return CITY_CENTERS[cityKey.trim().toLowerCase()] ?? DEFAULT_CENTER;
}
