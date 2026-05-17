/** Rich mock data for admin UI — replace with API responses in hooks. */

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
  status: "active" | "suspended" | "banned";
  avatarUrl: string | null;
};

export type AdminDriverRow = {
  id: string;
  name: string;
  vehicle: string;
  city: string;
  status: "online" | "offline" | "on_delivery" | "suspended";
  verification: "verified" | "pending" | "rejected";
  deliveries: number;
  rating: number;
  earnings: number;
  avatarUrl: string | null;
};

export type AdminDisputeRow = {
  id: string;
  type: string;
  orderId: string;
  parties: string;
  reportedAt: string;
  priority: "low" | "medium" | "high";
  assignee: string | null;
  status: "open" | "resolved";
};

export type AdminPaymentRow = {
  id: string;
  date: string;
  type: string;
  amount: number;
  party: string;
  status: string;
};

export type ActivityItem = {
  id: string;
  kind: "order" | "signup" | "driver_app" | "flag";
  title: string;
  detail: string;
  at: string;
};

export const MOCK_USERS: AdminUserRow[] = [
  {
    id: "u1",
    name: "Ali Hassan",
    email: "ali@example.com",
    phone: "+60120001111",
    totalOrders: 42,
    totalSpent: 1840,
    joinDate: "2025-11-01",
    status: "active",
    avatarUrl: null,
  },
  {
    id: "u2",
    name: "Sarah Lee",
    email: "sarah.l@example.com",
    phone: "+60192223333",
    totalOrders: 18,
    totalSpent: 620,
    joinDate: "2026-01-15",
    status: "active",
    avatarUrl: null,
  },
  {
    id: "u3",
    name: "Problem User",
    email: "bad@example.com",
    phone: "+60133334444",
    totalOrders: 3,
    totalSpent: 45,
    joinDate: "2026-03-20",
    status: "suspended",
    avatarUrl: null,
  },
];

export const MOCK_DRIVERS: AdminDriverRow[] = [
  {
    id: "d1",
    name: "Raju Kumar",
    vehicle: "Perodua Myvi · ABC 1234",
    city: "Kuala Lumpur",
    status: "online",
    verification: "verified",
    deliveries: 512,
    rating: 4.9,
    earnings: 42000,
    avatarUrl: null,
  },
  {
    id: "d2",
    name: "Mei Chen",
    vehicle: "Honda City · WXY 8899",
    city: "Petaling Jaya",
    status: "on_delivery",
    verification: "verified",
    deliveries: 301,
    rating: 4.8,
    earnings: 28500,
    avatarUrl: null,
  },
  {
    id: "d3",
    name: "New Applicant",
    vehicle: "Proton Saga · NEW 0001",
    city: "Shah Alam",
    status: "offline",
    verification: "pending",
    deliveries: 0,
    rating: 0,
    earnings: 0,
    avatarUrl: null,
  },
];

export const MOCK_DISPUTES: AdminDisputeRow[] = [
  {
    id: "disp1",
    type: "Package damaged",
    orderId: "ord-99",
    parties: "Sender: Ali / Driver: Raju",
    reportedAt: "2026-04-17T10:00:00",
    priority: "high",
    assignee: "Support A",
    status: "open",
  },
  {
    id: "disp2",
    type: "Not delivered",
    orderId: "ord-101",
    parties: "Sender: Sarah / Driver: —",
    reportedAt: "2026-04-16T14:20:00",
    priority: "medium",
    assignee: null,
    status: "open",
  },
];

export const MOCK_PAYMENTS: AdminPaymentRow[] = [
  { id: "p1", date: "2026-04-18", type: "Order payment", amount: 120.5, party: "Sender", status: "captured" },
  { id: "p2", date: "2026-04-18", type: "Driver payout", amount: -85, party: "Driver Raju", status: "pending" },
  { id: "p3", date: "2026-04-17", type: "Refund", amount: -24, party: "Sender Ali", status: "completed" },
];

export const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    kind: "order",
    title: "Order SW-88AA delivered",
    detail: "Kuala Lumpur → Putrajaya",
    at: new Date(Date.now() - 120_000).toISOString(),
  },
  {
    id: "a2",
    kind: "signup",
    title: "New sender registered",
    detail: "phone +6019…",
    at: new Date(Date.now() - 400_000).toISOString(),
  },
  {
    id: "a3",
    kind: "driver_app",
    title: "Driver application pending",
    detail: "New Applicant — Shah Alam",
    at: new Date(Date.now() - 900_000).toISOString(),
  },
  {
    id: "a4",
    kind: "flag",
    title: "Report flagged",
    detail: "Dispute disp1 escalated",
    at: new Date(Date.now() - 1_800_000).toISOString(),
  },
];

export const MOCK_AUDIT = [
  { id: "1", who: "admin@smartgateapp.com", action: "user.suspend", entity: "user:u3", at: "2026-04-17T08:00:00Z" },
  { id: "2", who: "support@smartgateapp.com", action: "dispute.assign", entity: "disp1", at: "2026-04-17T10:05:00Z" },
];

/** Demo document metadata for pending driver applications */
export const MOCK_DRIVER_DOCS = {
  license: { url: "#license", expiresOn: "2027-06-01" },
  vehicleReg: { url: "#reg", expiresOn: "2026-12-01" },
  insurance: { url: "#ins", expiresOn: "2026-08-15" },
} as const;

export type MockDriverDocKey = keyof typeof MOCK_DRIVER_DOCS;

export const MOCK_ADMIN_USERS = [
  { id: "adm1", name: "Super Admin", email: "super@smartgateapp.com", role: "super_admin" as const },
  { id: "adm2", name: "Support Lead", email: "support-lead@smartgateapp.com", role: "support_admin" as const },
  { id: "adm3", name: "Finance", email: "finance@smartgateapp.com", role: "finance_admin" as const },
];

export const MOCK_KPI_EXTRA = {
  activeDriversOnline: 42,
  activeDriversTotal: 156,
  ordersToday: 284,
  ordersYesterday: 251,
  revenueToday: 12480,
  revenueYesterday: 11020,
  pendingDisputes: 2,
  platformRating: 4.72,
  sendersCount: 8900,
};
