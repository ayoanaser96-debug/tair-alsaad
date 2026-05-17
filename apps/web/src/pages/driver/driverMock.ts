/** Mock types & data for driver dashboard — replace with API responses in hooks. */

export type AvailableOffer = {
  id: string;
  pickupLabel: string;
  dropLabel: string;
  distanceKm: number;
  estimatedEarnings: number;
  currency: string;
  packageType: string;
  senderRating: number;
  senderName: string;
  etaMinutes: number;
  /** ISO time when offer expires */
  expiresAt: string;
};

export type DeliveryStep =
  | "navigate_pickup"
  | "arrived_pickup"
  | "picked_up"
  | "navigate_delivery"
  | "arrived_delivery"
  | "delivered";

export type ActiveDelivery = {
  id: string;
  trackingCode: string;
  pickupLabel: string;
  dropLabel: string;
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  packageType: string;
  earnings: number;
  currency: string;
  currentStep: DeliveryStep;
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
};

export type HistoryRow = {
  id: string;
  date: string;
  trackingCode: string;
  route: string;
  earnings: number;
  ratingReceived: number | null;
  status: string;
};

export type EarningsDay = { day: string; amount: number };

export type TransactionRow = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
};

export type DriverDocument = {
  id: string;
  label: string;
  status: "verified" | "pending" | "expired" | "missing";
  expiresAt: string | null;
};

export type SenderReview = {
  id: string;
  senderName: string;
  rating: number;
  comment: string;
  date: string;
  trackingCode: string;
};

const CURRENCY = "MYR";

let offerSeq = 0;
function genOffers(): AvailableOffer[] {
  const now = Date.now();
  return [
    {
      id: `off-${++offerSeq}`,
      pickupLabel: "12 Jalan Merdeka, KL",
      dropLabel: "Unit 4, Cyberjaya Tech Park",
      distanceKm: 18.4,
      estimatedEarnings: 42.5,
      currency: CURRENCY,
      packageType: "MEDIUM",
      senderRating: 4.9,
      senderName: "Ahmad R.",
      etaMinutes: 12,
      expiresAt: new Date(now + 28_000).toISOString(),
    },
    {
      id: `off-${++offerSeq}`,
      pickupLabel: "Lot 7, PJ Central",
      dropLabel: "Putrajaya Hospital Main Entrance",
      distanceKm: 24.1,
      estimatedEarnings: 55,
      currency: CURRENCY,
      packageType: "DOCUMENT",
      senderRating: 4.7,
      senderName: "Sarah L.",
      etaMinutes: 18,
      expiresAt: new Date(now + 22_000).toISOString(),
    },
    {
      id: `off-${++offerSeq}`,
      pickupLabel: "Sunway Mall — North pickup",
      dropLabel: "Bandar Utama Phase 2",
      distanceKm: 9.2,
      estimatedEarnings: 28,
      currency: CURRENCY,
      packageType: "SMALL",
      senderRating: 5,
      senderName: "Ken T.",
      etaMinutes: 8,
      expiresAt: new Date(now + 26_000).toISOString(),
    },
  ];
}

export const MOCK_AVAILABLE_BASE = genOffers();

export const MOCK_ACTIVE_DELIVERY: ActiveDelivery | null = {
  id: "act-1",
  trackingCode: "SW-A1B2C3D4",
  pickupLabel: "88 Persiaran KLCC",
  dropLabel: "Bangsar Village II",
  senderName: "Nadia K.",
  senderPhone: "+60123456789",
  recipientName: "Lee Wei",
  recipientPhone: "+60199887766",
  packageType: "LARGE",
  earnings: 62,
  currency: CURRENCY,
  currentStep: "navigate_pickup",
};

export const MOCK_HISTORY: HistoryRow[] = [
  {
    id: "h1",
    date: "2026-04-17T14:30:00",
    trackingCode: "SW-001122AA",
    route: "KL Sentral → Mont Kiara",
    earnings: 38.5,
    ratingReceived: 5,
    status: "DELIVERED",
  },
  {
    id: "h2",
    date: "2026-04-17T09:15:00",
    trackingCode: "SW-003344BB",
    route: "Subang → Shah Alam",
    earnings: 24,
    ratingReceived: 4,
    status: "DELIVERED",
  },
  {
    id: "h3",
    date: "2026-04-16T18:00:00",
    trackingCode: "SW-005566CC",
    route: "KLIA → Putrajaya",
    earnings: 72,
    ratingReceived: 5,
    status: "DELIVERED",
  },
];

export const MOCK_WEEKLY_EARNINGS: EarningsDay[] = [
  { day: "Mon", amount: 120 },
  { day: "Tue", amount: 95 },
  { day: "Wed", amount: 140 },
  { day: "Thu", amount: 88 },
  { day: "Fri", amount: 160 },
  { day: "Sat", amount: 210 },
  { day: "Sun", amount: 45 },
];

export const MOCK_TRANSACTIONS: TransactionRow[] = [
  { id: "t1", date: "2026-04-17", description: "Delivery SW-001122AA", amount: 38.5, type: "credit" },
  { id: "t2", date: "2026-04-16", description: "Weekly payout", amount: 420, type: "debit" },
  { id: "t3", date: "2026-04-15", description: "Tip — SW-998877", amount: 5, type: "credit" },
];

export const MOCK_DOCUMENTS: DriverDocument[] = [
  { id: "d1", label: "Driver's license", status: "verified", expiresAt: "2027-06-01" },
  { id: "d2", label: "Vehicle registration", status: "verified", expiresAt: "2026-12-31" },
  { id: "d3", label: "Insurance", status: "expired", expiresAt: "2026-03-01" },
];

export const MOCK_REVIEWS: SenderReview[] = [
  {
    id: "r1",
    senderName: "Ahmad R.",
    rating: 5,
    comment: "Fast pickup, careful with fragile items.",
    date: "2026-04-15",
    trackingCode: "SW-77AA",
  },
  {
    id: "r2",
    senderName: "Priya S.",
    rating: 4,
    comment: "Good communication on traffic delay.",
    date: "2026-04-12",
    trackingCode: "SW-88BB",
  },
];

export function needsVerificationBanner(docs: DriverDocument[]): boolean {
  return docs.some((d) => d.status === "expired" || d.status === "missing");
}
