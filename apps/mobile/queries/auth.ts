import type { UseMutationOptions } from '@tanstack/react-query';

import { useMutation } from '@tanstack/react-query';

import type { ApiUser } from '@/lib/types';
import { normalizeUser } from '@/lib/types';

import { api, unwrapResponse } from '@/lib/api';

export type OtpVerifyResult = {
  user: ApiUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export function useRequestOtp(
  opts?: UseMutationOptions<{ expiresIn: number; devCode?: string }, Error, { phone: string }>,
) {
  return useMutation({
    mutationFn: async (payload: { phone: string }) => {
      const res = await api.post('/auth/otp/request', payload);
      return unwrapResponse<{ expiresIn: number; devCode?: string }>(res.data);
    },
    ...opts,
  });
}

export function useVerifyOtp(
  opts?: UseMutationOptions<
    OtpVerifyResult,
    Error,
    { phone: string; code: string; name?: string; role?: 'sender' | 'driver' }
  >,
) {
  return useMutation({
    mutationFn: async (payload: { phone: string; code: string; name?: string; role?: 'sender' | 'driver' }) => {
      const res = await api.post('/auth/otp/verify', payload);
      const data = unwrapResponse<{
        user: Record<string, unknown>;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      }>(res.data);
      const user = normalizeUser(data.user);
      return {
        user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
      };
    },
    ...opts,
  });
}
