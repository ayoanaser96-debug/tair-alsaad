import type { QuoteResponse, Shipment } from '@tayralsaad/types';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api, unwrapResponse } from '@/lib/api';

export const shipmentKeys = {
  all: ['shipments'] as const,
  mineInfinite: () => [...shipmentKeys.all, 'mine', 'inf'] as const,
  detail: (id: string) => [...shipmentKeys.all, 'detail', id] as const,
};

export type CreateShipmentPayload = Record<string, unknown>;

export type ShipmentsMinePage = {
  items: Shipment[];
  total: number;
};

export async function postQuote(body: Record<string, unknown>): Promise<QuoteResponse> {
  const res = await api.post('/shipments/quote', body);
  return unwrapResponse<QuoteResponse>(res.data);
}

export async function postCreateShipment(body: CreateShipmentPayload): Promise<Shipment> {
  const res = await api.post('/shipments', body);
  return unwrapResponse<Shipment>(res.data as never);
}

export async function fetchShipment(id: string): Promise<Shipment> {
  const res = await api.get(`/shipments/${id}`);
  return unwrapResponse<Shipment>(res.data as never);
}

export async function fetchShipmentsMinePage(page: number, limit = 30): Promise<ShipmentsMinePage> {
  const res = await api.get(`/shipments/mine`, { params: { page, limit } });
  return unwrapResponse<ShipmentsMinePage>(res.data);
}

export async function fetchShipmentsIncomingPage(page: number, limit = 30, status?: string): Promise<ShipmentsMinePage> {
  const params: Record<string, string | number> = { page, limit };
  if (status?.trim()) params.status = status.trim();
  const res = await api.get(`/shipments/incoming`, { params });
  return unwrapResponse<ShipmentsMinePage>(res.data);
}

export function useIncomingShipmentsInfinite(enabled: boolean, status?: string) {
  return useInfiniteQuery({
    queryKey: [...shipmentKeys.all, 'incoming', 'inf', status ?? 'all'],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchShipmentsIncomingPage(pageParam, 30, status),
    enabled,
    getNextPageParam: (last, allPages, lastPageParam) => {
      const seen = allPages.flatMap((p) => p.items).length;
      return last.items.length > 0 && seen < last.total ? lastPageParam + 1 : undefined;
    },
  });
}

/** Id from mongoose JSON (`_id` or stringified `id`). */
export function mongoId(shipment: Shipment): string {
  const r = shipment as unknown as Record<string, unknown>;
  return String(r._id ?? r.id ?? '');
}

export function useShipmentDetail(id?: string | null) {
  const sid = typeof id === 'string' ? id : '';
  return useQuery({
    queryKey: shipmentKeys.detail(sid),
    enabled: /^[a-f\d]{24}$/i.test(sid),
    queryFn: () => fetchShipment(sid),
  });
}

export function useMyShipmentsInfinite() {
  return useInfiniteQuery({
    queryKey: shipmentKeys.mineInfinite(),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchShipmentsMinePage(pageParam),
    getNextPageParam: (last, allPages, lastPageParam) => {
      const seen = allPages.flatMap((p) => p.items).length;
      return last.items.length > 0 && seen < last.total ? lastPageParam + 1 : undefined;
    },
  });
}

export function useCreateShipmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postCreateShipment,
    onSuccess: () => void qc.invalidateQueries({ queryKey: shipmentKeys.all }),
  });
}

export function useCancelShipmentMutation(id: string | null) {
  const qc = useQueryClient();
  const sid = typeof id === 'string' ? id : '';
  return useMutation({
    mutationFn: async (reason: string) => {
      if (!sid) throw new Error('missing shipment id');
      await api.post(`/shipments/${sid}/cancel`, { reason });
      return fetchShipment(sid);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: shipmentKeys.detail(sid) });
      void qc.invalidateQueries({ queryKey: shipmentKeys.mineInfinite() });
    },
  });
}

export function useRateShipmentMutation(id: string | null) {
  const qc = useQueryClient();
  const sid = typeof id === 'string' ? id : '';
  return useMutation({
    mutationFn: async (payload: { stars: 1 | 2 | 3 | 4 | 5; comment?: string }) => {
      if (!sid) throw new Error('missing shipment id');
      await api.post(`/shipments/${sid}/rate`, payload);
      return fetchShipment(sid);
    },
    onSuccess: (fresh) => {
      void qc.setQueryData(shipmentKeys.detail(sid), fresh);
      void qc.invalidateQueries({ queryKey: shipmentKeys.mineInfinite() });
    },
  });
}

export async function postShipmentDispute(sid: string, body: { reason: string; photoUrls: string[] }): Promise<Shipment> {
  await api.post(`/shipments/${encodeURIComponent(sid)}/dispute`, body);
  return fetchShipment(sid);
}

export function useDisputeShipmentMutation(id: string | null) {
  const qc = useQueryClient();
  const sid = typeof id === 'string' ? id : '';
  return useMutation({
    mutationFn: (body: { reason: string; photoUrls: string[] }) => {
      if (!sid) throw new Error('missing shipment id');
      return postShipmentDispute(sid, body);
    },
    onSuccess: (fresh) => {
      void qc.setQueryData(shipmentKeys.detail(sid), fresh);
      void qc.invalidateQueries({ queryKey: shipmentKeys.mineInfinite() });
    },
  });
}
