import type { AuthResponse, MeUser } from "@/features/auth/schemas";
import type { OrderDTO } from "@/features/orders/schemas";

const API_BASE = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3333").replace(/\/$/, "");

export const AUTH_STORAGE_KEY = "tairalsaad_auth";

export type { HealthResponse } from "@/lib/api/health";
export { getHealth } from "@/lib/api/health";

export type { City } from "@/lib/api/cities";
export { getCities } from "@/lib/api/cities";

export type { AuthUser, AuthResponse, MeUser } from "@/features/auth/schemas";
export type { OrderDTO } from "@/features/orders/schemas";

export type OrdersAdmin = { kind: "admin"; orders: OrderDTO[] };
export type OrdersSender = { kind: "sender"; orders: OrderDTO[] };
export type OrdersDriver = {
  kind: "driver";
  myDeliveries: OrderDTO[];
  available: OrderDTO[];
};

export type AdminStats = {
  users: number;
  orders: number;
  cities: number;
  ordersByStatus: Record<string, number>;
  usersByRole: Record<string, number>;
};

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

function authHeader(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export async function login(identifier: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: identifier, password }),
  });
  const data = await parseJson<AuthResponse & { error?: string }>(res);
  if (!res.ok) throw new Error(data.error ?? res.statusText);
  return data as AuthResponse;
}

export async function register(body: {
  name: string;
  phone: string;
  password: string;
  role: "SENDER" | "DRIVER";
  cityId: string | null;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...body,
      cityId: body.cityId || undefined,
    }),
  });
  const data = await parseJson<AuthResponse & { error?: string }>(res);
  if (!res.ok) throw new Error(data.error ?? res.statusText);
  return data as AuthResponse;
}

export function loadStoredAuth(): AuthResponse | null {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthResponse;
  } catch {
    return null;
  }
}

export function saveAuth(data: AuthResponse): void {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
}

export function clearAuth(): void {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

export async function fetchMe(accessToken: string): Promise<{ user: MeUser }> {
  const res = await fetch(`${API_BASE}/me`, { headers: { ...authHeader(accessToken) } });
  const data = await parseJson<{ user?: MeUser; error?: string }>(res);
  if (!res.ok) throw new Error(data.error ?? "Failed to load profile");
  return { user: data.user! };
}

export async function fetchOrders(accessToken: string): Promise<OrdersAdmin | OrdersSender | OrdersDriver> {
  const res = await fetch(`${API_BASE}/orders`, { headers: { ...authHeader(accessToken) } });
  const data = await parseJson<OrdersAdmin | OrdersSender | OrdersDriver | { error?: string }>(res);
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Failed to load orders");
  return data as OrdersAdmin | OrdersSender | OrdersDriver;
}

export async function fetchAdminStats(accessToken: string): Promise<AdminStats> {
  const res = await fetch(`${API_BASE}/stats`, { headers: { ...authHeader(accessToken) } });
  const data = await parseJson<AdminStats & { error?: string }>(res);
  if (!res.ok) throw new Error(data.error ?? "Failed to load stats");
  return data as AdminStats;
}
