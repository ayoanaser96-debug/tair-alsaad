export type Role = 'sender' | 'receiver' | 'driver' | 'admin';
export type PreferredLanguage = 'ar' | 'en';

export type ShipmentStatus =
  | 'pending'
  | 'assigned'
  | 'arrived_pickup'
  | 'picked_up'
  | 'in_transit'
  | 'arrived_dropoff'
  | 'delivered'
  | 'cancelled'
  | 'disputed';

export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
export type PackageType = 'envelope' | 'small' | 'medium' | 'large' | 'fragile' | 'cold';
export type ServiceTier = 'standard' | 'express' | 'scheduled';
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

export type ShipmentPricing = {
  base: number;
  distance: number;
  surcharge: number;
  surge: number;
  total: number;
  driverPayout: number;
};

export type ShipmentPackage = {
  type: PackageType;
  weightTier: WeightTier;
  description?: string;
  declaredValue?: number;
};

export type ShipmentReceiver = {
  name: string;
  phone: string;
};

export type ShipmentPayment = {
  method: PaymentMethod;
  status: PaymentStatus;
  providerRef?: string;
  paidAt?: string;
};

export type ShipmentProofs = {
  pickupPhotoUrl?: string;
  deliveryPhotoUrl?: string;
  signatureUrl?: string;
};

export type ShipmentRating = {
  stars: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  at: string;
};

export type ShipmentStatusHistoryEntry = {
  status: ShipmentStatus;
  at: string;
  by?: string;
  location?: { lat: number; lng: number };
};

export type ShipmentDispute = {
  reason?: string;
  photoUrls?: string[];
  openedAt?: string;
  resolution?: string;
  refundAmount?: number;
  resolvedAt?: string;
  resolved?: boolean;
};

/** Shipment document returned by `/shipments` API (Mongoose lean JSON). */
export type Shipment = {
  id?: string;
  _id?: string;
  trackingCode: string;
  senderId?: string;
  driverId?: string;
  pickup: Address;
  dropoff: Address;
  receiver: ShipmentReceiver;
  package: ShipmentPackage;
  service: ServiceTier;
  scheduledFor?: string;
  pricing: ShipmentPricing;
  payment: ShipmentPayment;
  status: ShipmentStatus;
  statusHistory: ShipmentStatusHistoryEntry[];
  pickupOtp?: string;
  deliveryOtp?: string;
  proofs?: ShipmentProofs;
  rating?: ShipmentRating;
  cancelledReason?: string;
  cancelledAt?: string;
  dispute?: ShipmentDispute;
  etaMinutes?: number;
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
