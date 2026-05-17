import type { PublicTrackingPayload } from '@tayralsaad/types';
import { useQuery } from '@tanstack/react-query';

import { api, unwrapResponse } from '@/lib/api';

export const publicTrackKeys = {
  all: ['publicTrack'] as const,
  byCode: (code: string) => [...publicTrackKeys.all, code] as const,
};

export async function fetchPublicTracking(trackingCode: string): Promise<PublicTrackingPayload> {
  const code = encodeURIComponent(trackingCode.trim().toUpperCase());
  const res = await api.get(`/track/${code}`);
  return unwrapResponse<PublicTrackingPayload>(res.data);
}

export function usePublicTracking(trackingCode: string | null, enabled: boolean) {
  const normalized = trackingCode?.trim().toUpperCase() ?? '';
  const ok = enabled && normalized.length >= 4;

  return useQuery({
    queryKey: publicTrackKeys.byCode(normalized),
    queryFn: () => fetchPublicTracking(normalized),
    enabled: ok,
  });
}
