import { env } from "@/config/env";

type ApiOk<T> = { ok: true; data: T };

function unwrapOk<T>(body: unknown): T {
  const b = body as ApiOk<T> | { ok: false; error?: { messageEn?: string; message?: string } };
  if (!b || typeof b !== "object" || !("ok" in b)) throw new Error("Unexpected API response");
  if (!b.ok) {
    const e = b.error;
    throw new Error((e?.messageEn ?? e?.message ?? "Request failed").trim());
  }
  return b.data;
}

export type PublicTrackingPayload = {
  shipmentId?: string;
  status: string;
  trackingCode?: string;
  pickupCity?: string;
  pickupLocation?: { lat: number; lng: number };
  dropoffCity?: string;
  dropoffLocation?: { lat: number; lng: number };
  receiver?: { firstName?: string };
  driver?: unknown;
  driverLocation?: { lat: number; lng: number; at?: string };
  etaMinutes?: number;
  statusHistory?: Array<{ status: string; at: string | Date }>;
};

export async function fetchPublicTracking(trackingCode: string): Promise<PublicTrackingPayload> {
  const code = encodeURIComponent(trackingCode.trim().toUpperCase());
  const res = await fetch(`${env.VITE_API_URL}/track/${code}`);
  const json = (await res.json()) as unknown;
  if (!res.ok) {
    unwrapOk<never>(json);
  }
  return unwrapOk<PublicTrackingPayload>(json);
}
