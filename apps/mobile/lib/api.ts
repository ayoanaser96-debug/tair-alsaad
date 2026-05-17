import type { ApiErrorPayload, ApiSuccess } from '@tayralsaad/types';
import axios from 'axios';
import Constants from 'expo-constants';

import { useAuthStore } from '@/stores/authStore';

import { clearTokens } from './secure';

import { triggerUnauthorized } from './authEvents';

const baseURL = Constants.expoConfig?.extra?.apiUrl as string;

export class HttpApiError extends Error {
  readonly code: string;
  readonly messageAr: string;
  readonly messageEn: string;
  readonly status?: number;

  constructor(error: ApiErrorPayload, status?: number) {
    super(error.message);
    this.code = error.code;
    this.messageAr = error.message;
    this.messageEn = error.messageEn;
    this.status = status;
    this.name = 'HttpApiError';
  }
}

export function unwrapResponse<T>(data: unknown): T {
  const body = data as ApiSuccess<T> | { ok: false; error: ApiErrorPayload };
  if (!body || typeof body !== 'object' || !('ok' in body)) {
    throw new HttpApiError({ code: 'UNKNOWN', message: 'استجابة غير متوقعة', messageEn: 'Unexpected response.' });
  }
  if (!body.ok) throw new HttpApiError(body.error);
  return body.data as T;
}

function toHttpError(error: unknown, status?: number): Error {
  if (error instanceof HttpApiError) return error;
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { ok?: false; error?: ApiErrorPayload } | undefined;
    if (data?.error) return new HttpApiError(data.error, error.response?.status);
    const code = error.code === 'ERR_NETWORK' ? 'NETWORK' : 'UNKNOWN';
    return new HttpApiError(
      {
        code,
        message:
          code === 'NETWORK' ? 'تحقق من اتصال الإنترنت.' : 'خطأ غير متوقع. حاول مجددًا.',
        messageEn:
          code === 'NETWORK'
            ? 'Check your internet connection.'
            : 'Unexpected error. Please try again.',
      },
      error.response?.status,
    );
  }
  return new HttpApiError({ code: 'UNKNOWN', message: 'خطأ غير متوقع', messageEn: 'Unexpected error.' }, status);
}

type RetryableConfig = { _retry?: boolean; url?: string; headers: Record<string, string> };

export const api = axios.create({
  baseURL,
  timeout: 25_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshChain: Promise<string | null> | null = null;

async function refreshSession(): Promise<string | null> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return null;
  try {
    const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
    const data = unwrapResponse<{ accessToken: string; refreshToken: string; expiresIn: number }>(res.data);
    await useAuthStore.getState().updateTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const axiosError = axios.isAxiosError(error) ? error : null;
    const status = axiosError?.response?.status;
    if (!axiosError || !axiosError.config) {
      return Promise.reject(toHttpError(error));
    }
    const originalRequest = axiosError.config as RetryableConfig;

    const isRefreshCall = typeof originalRequest.url === 'string' && originalRequest.url.includes('/auth/refresh');

    if (status !== 401 || originalRequest._retry || isRefreshCall) {
      if (status === 401 && isRefreshCall) {
        await clearTokens().catch(() => undefined);
        useAuthStore.setState({
          accessToken: null,
          refreshToken: null,
          user: null,
          appHomeSegment: null,
          hydrated: true,
        });
        triggerUnauthorized();
      }
      return Promise.reject(toHttpError(error, status));
    }

    originalRequest._retry = true;
    refreshChain ??= refreshSession().finally(() => {
      refreshChain = null;
    });
    const access = await refreshChain;

    if (!access) {
      await useAuthStore.getState().logout();
      triggerUnauthorized();
      return Promise.reject(
        new HttpApiError({ code: 'UNAUTHORIZED', message: 'انتهت الجلسة', messageEn: 'Session expired.' }, 401),
      );
    }

    originalRequest.headers.Authorization = `Bearer ${access}`;
    return api(originalRequest);
  },
);
