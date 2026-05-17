export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = deg2rad(b.lat - a.lat);
  const dLon = deg2rad(b.lng - a.lng);
  const lat1 = deg2rad(a.lat);
  const lat2 = deg2rad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function deg2rad(n: number) {
  return (n * Math.PI) / 180;
}

export function etaMinutes(distanceKm: number, avgKmH = 32): number {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return 15;
  return Math.max(15, Math.round((distanceKm / avgKmH) * 60));
}
