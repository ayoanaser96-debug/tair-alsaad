/**
 * Adapters between the REAL Tayr Al-Saad API (apps/api) and the shapes the web
 * app's schemas expect. The API is the source of truth and must not change, so
 * all translation lives here.
 *
 * Envelope: every /api/v1 success is `{ ok: true, data: T }` and every failure
 * is `{ ok: false, error: { code, message, messageEn } }` (see apps/api
 * utils/apiResponse.ts).
 */

type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error?: { message?: string; messageEn?: string; code?: string } };

/** Unwrap the `{ ok, data }` envelope, throwing the server message on failure. */
export function unwrap<T>(raw: unknown): T {
  const body = raw as ApiEnvelope<T>;
  if (!body || typeof body !== "object" || !("ok" in body)) {
    throw new Error("Unexpected API response shape");
  }
  if (!body.ok) {
    const e = body.error;
    throw new Error((e?.messageEn ?? e?.message ?? "Request failed").trim());
  }
  return body.data;
}

function toIso(value: unknown): string {
  if (typeof value === "string" && value) return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number") return new Date(value).toISOString();
  return new Date().toISOString();
}

function idOf(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toString" in value) return String(value);
  return "";
}

type RawAddress = {
  city?: string;
  area?: string;
  street?: string;
  building?: string;
  notes?: string;
  location?: { lat?: number; lng?: number };
};

export function formatAddress(addr?: RawAddress | null): string {
  if (!addr) return "";
  return [addr.area, addr.street, addr.building, addr.city]
    .map((p) => (typeof p === "string" ? p.trim() : ""))
    .filter(Boolean)
    .join(", ");
}

/** A raw Shipment document as serialized by apps/api (Mongoose toJSON). */
export type RawShipment = {
  _id?: unknown;
  id?: unknown;
  trackingCode?: string;
  status?: string;
  senderId?: unknown;
  driverId?: unknown;
  pickup?: RawAddress;
  dropoff?: RawAddress;
  receiver?: { name?: string; phone?: string };
  package?: { type?: string; weightTier?: string; description?: string; declaredValue?: number };
  service?: string;
  scheduledFor?: string | null;
  pricing?: { total?: number };
  payment?: { method?: string; status?: string };
  statusHistory?: Array<{ status?: string; at?: unknown }>;
  proofs?: { pickupPhotoUrl?: string; deliveryPhotoUrl?: string; signatureUrl?: string };
  rating?: { stars?: number; comment?: string } | null;
  createdAt?: unknown;
  updatedAt?: unknown;
};

/** Map a raw shipment to the web `OrderDetail` schema shape. */
export function shipmentToOrderDetail(s: RawShipment): Record<string, unknown> {
  const status = (s.status ?? "").toUpperCase();
  const hasDriver = !!s.driverId;
  return {
    id: idOf(s._id ?? s.id),
    trackingCode: s.trackingCode ?? "",
    status,
    price: s.pricing?.total ?? 0,
    receiverName: s.receiver?.name ?? "",
    receiverPhone: s.receiver?.phone ?? "",
    pickupAddress: formatAddress(s.pickup),
    dropAddress: formatAddress(s.dropoff),
    packageType: s.package?.type ?? "",
    paymentStatus: s.payment?.status ?? "",
    createdAt: toIso(s.createdAt),
    sender: { id: idOf(s.senderId), name: "", phone: "" },
    driver: hasDriver
      ? { id: idOf(s.driverId), name: "", phone: "", avatarUrl: null, vehicleInfo: null }
      : null,
    city: {
      id: s.pickup?.city ?? "",
      name: s.pickup?.city ?? "",
      country: "IQ",
    },
    paymentMethod: s.payment?.method ?? "",
    notes: s.package?.description ?? null,
    updatedAt: toIso(s.updatedAt),
    extras: null,
    deliveryWindow: null,
    scheduledAt: s.scheduledFor ?? null,
    rating: typeof s.rating?.stars === "number" ? s.rating.stars : null,
    reviewComment: s.rating?.comment ?? null,
    podPhotoUrl: s.proofs?.deliveryPhotoUrl ?? null,
    podSignatureUrl: s.proofs?.signatureUrl ?? null,
    statusHistory: (s.statusHistory ?? []).map((h, i) => ({
      id: String(i),
      status: (h.status ?? "").toUpperCase(),
      note: null,
      createdAt: toIso(h.at),
    })),
  };
}

/** Map a raw shipment to the leaner `OrderDTO` (admin table) shape. */
export function shipmentToOrderDto(s: RawShipment): Record<string, unknown> {
  const full = shipmentToOrderDetail(s);
  return {
    id: full.id,
    trackingCode: full.trackingCode,
    status: full.status,
    price: full.price,
    receiverName: full.receiverName,
    receiverPhone: full.receiverPhone,
    pickupAddress: full.pickupAddress,
    dropAddress: full.dropAddress,
    packageType: full.packageType,
    paymentStatus: full.paymentStatus,
    createdAt: full.createdAt,
    sender: full.sender,
    driver: full.driver
      ? {
          id: (full.driver as Record<string, unknown>).id,
          name: "",
          phone: "",
        }
      : null,
    city: full.city,
  };
}

/** Which raw (lowercase) API statuses belong to each sender list tab. */
export function shipmentMatchesTab(rawStatus: string, tab: string): boolean {
  const s = (rawStatus ?? "").toLowerCase();
  switch (tab) {
    case "completed":
      return s === "delivered";
    case "cancelled":
      return s === "cancelled";
    case "drafts":
      return false; // API has no draft concept
    case "active":
    default:
      return !["delivered", "cancelled"].includes(s);
  }
}
