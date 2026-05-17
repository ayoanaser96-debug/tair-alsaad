import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Address } from '@tayralsaad/types';

import { api, unwrapResponse } from '@/lib/api';
import { normalizeUser, type ApiUser } from '@/lib/types';
import { useAuthStore } from '@/stores/authStore';

export const meKeys = { all: ['me'] as const };

export async function fetchMe(): Promise<ApiUser> {
  const res = await api.get('/me');
  const raw = unwrapResponse<Record<string, unknown>>(res.data);
  return normalizeUser(raw);
}

export type SaveAddressPayload = Pick<Address, 'city' | 'area' | 'location'> &
  Partial<Pick<Address, 'label' | 'street' | 'building' | 'notes'>>;

export async function postSavedAddress(payload: SaveAddressPayload): Promise<ApiUser> {
  const res = await api.post('/me/addresses', payload);
  const raw = unwrapResponse<Record<string, unknown>>(res.data);
  return normalizeUser(raw);
}

export async function deleteSavedAddress(serverId: string): Promise<ApiUser> {
  const res = await api.delete(`/me/addresses/${encodeURIComponent(serverId)}`);
  const raw = unwrapResponse<Record<string, unknown>>(res.data);
  return normalizeUser(raw);
}

export function useMe() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: meKeys.all,
    enabled: Boolean(token),
    queryFn: fetchMe,
  });
}

export function useAddSavedAddressMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postSavedAddress,
    onSuccess: (user) => {
      qc.setQueryData(meKeys.all, user);
    },
  });
}

export function useDeleteSavedAddressMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSavedAddress,
    onSuccess: (user) => {
      qc.setQueryData(meKeys.all, user);
    },
  });
}
