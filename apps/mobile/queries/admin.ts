import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api, unwrapResponse } from '@/lib/api';

export const adminKeys = {
  all: ['admin'] as const,
  overview: () => [...adminKeys.all, 'overview'] as const,
  shipments: (page: number) => [...adminKeys.all, 'shipments', page] as const,
  drivers: (page: number) => [...adminKeys.all, 'drivers', page] as const,
  disputes: (page: number) => [...adminKeys.all, 'disputes', page] as const,
  users: (page: number) => [...adminKeys.all, 'users', page] as const,
};

export type AdminOverview = {
  totalUsers?: number;
  totalDrivers?: number;
  pendingDrivers: number;
  pendingShipments: number;
  onlineDrivers: number;
  openDisputes: number;
  shipmentsInFlight: number;
  completedToday: number;
  gmvToday: number;
  recentShipments: Array<{
    trackingCode?: string;
    status?: string;
    updatedAt?: string;
    pickup?: { city?: string };
    dropoff?: { city?: string };
    pricing?: { total?: number };
  }>;
};

export async function fetchAdminOverview(): Promise<AdminOverview> {
  const res = await api.get('/admin/overview');
  return unwrapResponse<AdminOverview>(res.data);
}

export type AdminShipmentList = { items: unknown[]; total: number };

export async function fetchAdminShipments(page = 1): Promise<AdminShipmentList> {
  const res = await api.get('/admin/shipments', { params: { page, limit: 20 } });
  return unwrapResponse<AdminShipmentList>(res.data);
}

export type AdminDriverRow = Record<string, unknown> & {
  _id?: string;
  status?: string;
  isOnline?: boolean;
  vehicle?: Record<string, unknown>;
  userId?: { name?: string; phone?: string };
};

export type AdminDriverList = { items: AdminDriverRow[]; total: number };

export async function fetchAdminDrivers(page = 1, status?: string): Promise<AdminDriverList> {
  const params: Record<string, string | number> = { page, limit: 20 };
  if (typeof status === 'string' && status.trim()) params.status = status.trim();
  const res = await api.get('/admin/drivers', { params });
  return unwrapResponse<AdminDriverList>(res.data);
}

export async function patchAdminDriverStatus(
  driverId: string,
  body: { status: 'pending_review' | 'active' | 'suspended' | 'rejected'; reason?: string },
): Promise<unknown> {
  const res = await api.patch(`/admin/drivers/${encodeURIComponent(driverId)}/status`, body);
  return unwrapResponse(res.data);
}

export type AdminDisputeShipment = Record<string, unknown> & {
  trackingCode?: string;
  dispute?: Record<string, unknown>;
};

export type AdminDisputeList = { items: AdminDisputeShipment[]; total: number };

export async function fetchAdminDisputes(page = 1): Promise<AdminDisputeList> {
  const res = await api.get('/admin/disputes', { params: { page, limit: 20, status: 'open' } });
  return unwrapResponse<AdminDisputeList>(res.data);
}

export type AdminUserRow = {
  id: string;
  name: string;
  phone: string;
  role: string;
  createdAt?: string;
};

export type AdminUserList = { items: AdminUserRow[]; total: number };

export async function fetchAdminUsers(page = 1, limit = 40): Promise<AdminUserList> {
  const res = await api.get('/admin/users', { params: { page, limit } });
  return unwrapResponse<AdminUserList>(res.data);
}

export function useAdminUsersInfinite(enabled: boolean) {
  return useInfiniteQuery({
    queryKey: [...adminKeys.all, 'users', 'inf'],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchAdminUsers(pageParam, 40),
    enabled,
    getNextPageParam: (last, allPages, lastPageParam) => {
      const seen = allPages.flatMap((p) => p.items).length;
      return seen < last.total ? lastPageParam + 1 : undefined;
    },
  });
}

export function useAdminUsers(page: number, enabled: boolean) {
  return useQuery({
    queryKey: adminKeys.users(page),
    queryFn: () => fetchAdminUsers(page),
    enabled,
  });
}

export function useAdminOverview(enabled: boolean) {
  return useQuery({
    queryKey: adminKeys.overview(),
    queryFn: fetchAdminOverview,
    enabled,
  });
}

export function useAdminShipments(page: number, enabled: boolean) {
  return useQuery({
    queryKey: adminKeys.shipments(page),
    queryFn: () => fetchAdminShipments(page),
    enabled,
  });
}

export function useAdminDrivers(page: number, enabled: boolean, status?: string) {
  return useQuery({
    queryKey: [...adminKeys.drivers(page), status ?? 'all'],
    queryFn: () => fetchAdminDrivers(page, status),
    enabled,
  });
}

export function useAdminDriverStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      driverId: string;
      status: 'pending_review' | 'active' | 'suspended' | 'rejected';
      reason?: string;
    }) => patchAdminDriverStatus(params.driverId, { status: params.status, reason: params.reason }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useAdminDisputes(page: number, enabled: boolean) {
  return useQuery({
    queryKey: adminKeys.disputes(page),
    queryFn: () => fetchAdminDisputes(page),
    enabled,
  });
}
