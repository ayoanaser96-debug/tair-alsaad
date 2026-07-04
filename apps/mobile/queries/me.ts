import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Address } from '@tayralsaad/types';

import { api, unwrapResponse } from '@/lib/api';
import { normalizeUser, type ApiUser, type SavedAddressRow } from '@/lib/types';
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

/** Partial, owner-scoped update. Cache is reconciled via optimistic update + invalidate. */
export async function patchSavedAddress(serverId: string, patch: SaveAddressPayload): Promise<void> {
  await api.patch(`/me/addresses/${encodeURIComponent(serverId)}`, patch);
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

export function useUpdateSavedAddressMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ serverId, patch }: { serverId: string; patch: SaveAddressPayload }) =>
      patchSavedAddress(serverId, patch),
    onMutate: async ({ serverId, patch }) => {
      await qc.cancelQueries({ queryKey: meKeys.all });
      const prev = qc.getQueryData<ApiUser>(meKeys.all);
      if (prev?.defaultAddresses) {
        const next: ApiUser = {
          ...prev,
          defaultAddresses: prev.defaultAddresses.map((addr) =>
            addr.serverId === serverId ? ({ ...addr, ...patch } as SavedAddressRow) : addr,
          ),
        };
        qc.setQueryData(meKeys.all, next);
      }
      return { prev };
    },
    onError: (_error, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(meKeys.all, ctx.prev);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: meKeys.all });
    },
  });
}
