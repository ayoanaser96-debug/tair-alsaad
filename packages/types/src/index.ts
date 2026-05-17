export type Role = 'sender' | 'receiver' | 'driver' | 'admin';
export type PreferredLanguage = 'ar' | 'en';

export type ShipmentStatus =
  | 'pending'
  | 'accepted'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'disputed';

export type ServiceTier = 'express' | 'same_day' | 'scheduled';
export type PackageType = 'document' | 'box' | 'fragile' | 'other';
export type WeightTier = 'light' | 'medium' | 'heavy';
export type PaymentMethod = 'cash_on_delivery' | 'zaincash' | 'fastpay' | 'fib' | 'asia_hawala';

export type Address = {
  id?: string;
  label?: string;
  city: string;
  area: string;
  street?: string;
  building?: string;
  notes?: string;
  location: { lat: number; lng: number };
};

export type Shipment = {
  id: string;
  trackingCode?: string;
  status: ShipmentStatus | string;
  serviceTier?: ServiceTier | string;
  paymentMethod?: PaymentMethod | string;
  amount?: number;
  senderName?: string;
  senderPhone?: string;
  recipientName?: string;
  recipientPhone?: string;
  pickupAddress?: Address;
  dropoffAddress?: Address;
  createdAt?: string;
  updatedAt?: string;
};

export type QuoteResponse = {
  pricing: {
    base: number;
    distance: number;
    surcharge: number;
    surge: number;
    total: number;
    driverPayout: number;
  };
  distanceKm?: number;
  etaMinutes?: number;
};

export type ApiErrorPayload = {
  code: string;
  message: string;
  messageEn: string;
  details?: unknown;
};

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: ApiErrorPayload;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/** Public GET `/track/:trackingCode` — no authentication. */
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
  driverLocation?: { lat?: number; lng?: number; at?: string };
  etaMinutes?: number;
  statusHistory?: Array<{ status: string; at: string }>;
};
