import type { Shipment } from '@tayralsaad/types';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api, unwrapResponse } from '@/lib/api';

export const driverKeys = {
  all: ['driver'] as const,
  me: () => [...driverKeys.all, 'me'] as const,
  activeShipment: () => [...driverKeys.all, 'activeShipment'] as const,
  earnings: () => [...driverKeys.all, 'earnings'] as const,
};

export type DriverMe = Record<string, unknown> & {
  _id: string;
  isOnline?: boolean;
  status?: string;
  vehicle?: { type: string; plate: string; model: string; color: string };
};

export type DriverEarnings = {
  available: number;
  pendingPayout: number;
  totalEarned: number;
  recent: Array<{ trackingCode: string; status: string; pricing: { driverPayout?: number } }>;
};

export function driverMongoId(raw: DriverMe | Record<string, unknown>): string {
  return String(raw._id ?? raw.id ?? '');
}

export async function fetchDriverMe(): Promise<DriverMe> {
  const res = await api.get('/driver/me');
  return unwrapResponse<DriverMe>(res.data);
}

export async function patchDriverOnline(isOnline: boolean): Promise<DriverMe> {
  const res = await api.patch('/driver/online', { isOnline });
  return unwrapResponse<DriverMe>(res.data);
}

export async function fetchDriverFeed(lat: number, lng: number, radius = 15): Promise<Shipment[]> {
  const res = await api.get('/shipments/feed', { params: { lat, lng, radius } });
  const data = unwrapResponse<unknown>(res.data);
  return Array.isArray(data) ? (data as Shipment[]) : [];
}

export async function fetchActiveShipment(): Promise<Shipment | null> {
  const res = await api.get('/driver/active-shipment');
  return unwrapResponse<Shipment | null>(res.data);
}

export async function fetchShipment(id: string): Promise<Shipment> {
  const res = await api.get(`/shipments/${id}`);
  return unwrapResponse<Shipment>(res.data as never);
}

export async function uploadShipmentPhoto(localUri: string): Promise<string> {
  const form = new FormData();
  form.append('file', {
    uri: localUri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);
  const res = await api.post('/uploads', form);
  return unwrapResponse<{ url: string }>(res.data).url;
}

export function useDriverMe(enabled: boolean) {
  return useQuery({
    queryKey: driverKeys.me(),
    queryFn: fetchDriverMe,
    enabled,
    retry: 1,
  });
}

export function useDriverOnlineToggle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: patchDriverOnline,
    onSuccess: (d) => {
      qc.setQueryData(driverKeys.me(), d);
    },
  });
}

export function useDriverFeed(lat: number | null, lng: number | null) {
  return useQuery({
    queryKey: ['shipments', 'feed', lat, lng],
    enabled: lat !== null && lng !== null && Number.isFinite(lat) && Number.isFinite(lng),
    queryFn: () => fetchDriverFeed(lat!, lng!),
    staleTime: 15_000,
  });
}

export function useActiveShipmentDriver() {
  return useQuery({
    queryKey: driverKeys.activeShipment(),
    queryFn: fetchActiveShipment,
    staleTime: 5000,
  });
}

export function useShipmentDetailDriver(id?: string | null) {
  const sid = typeof id === 'string' ? id : '';
  return useQuery({
    queryKey: ['shipments', 'detailDriver', sid],
    enabled: /^[a-f\d]{24}$/i.test(sid),
    queryFn: () => fetchShipment(sid),
    refetchInterval: 60_000,
  });
}

export function useDriverEarnings(enabled = true) {
  return useQuery({
    queryKey: driverKeys.earnings(),
    enabled,
    queryFn: async () => {
      const res = await api.get('/driver/earnings');
      return unwrapResponse<DriverEarnings>(res.data);
    },
  });
}

export function useAcceptShipmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (shipmentId: string) => {
      const res = await api.post(`/shipments/${shipmentId}/accept`);
      return unwrapResponse<Shipment>(res.data as never);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: driverKeys.activeShipment() });
      void qc.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
}

export function useRequestPayoutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post('/driver/payout/request');
      return unwrapResponse<unknown>(res.data);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: driverKeys.earnings() }),
  });
}

export type ApplyDriverResult = {
  driver: DriverMe;
  user?: Record<string, unknown>;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
};

export async function postApplyDriver(payload: Record<string, unknown>): Promise<ApplyDriverResult> {
  const res = await api.post('/driver/apply', payload);
  const data = unwrapResponse<{
    driver?: DriverMe;
    user?: Record<string, unknown>;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
  } & DriverMe>(res.data);

  if (data.driver) {
    return {
      driver: data.driver,
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
    };
  }

  return { driver: data as DriverMe };
}
