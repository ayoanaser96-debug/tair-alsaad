import axios, { type AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { z } from "zod";

import { env } from "@/config/env";
import i18n from "@/i18n/config";

/** Legacy key — migrated once into zustand persist */
export const LEGACY_AUTH_STORAGE_KEY = "tairalsaad_auth";

let navigateToLogin: (() => void) | null = null;

export function setAuthNavigate(fn: () => void) {
  navigateToLogin = fn;
}

export const apiClient = axios.create({
  baseURL: env.VITE_API_URL,
  timeout: 60_000,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

/** Attach Bearer from getter (set by auth store after init) */
let getAccessToken: () => string | null = () => null;

export function setTokenGetter(fn: () => string | null) {
  getAccessToken = fn;
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ error?: string; message?: string }>) => {
    const status = error.response?.status;
    const raw = error.response?.data?.error ?? error.response?.data?.message;
    const serverMsg = typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
    const reqUrl = error.config?.url ?? "";

    const isLoginOrRegister =
      reqUrl.includes("/auth/login") || reqUrl.includes("/auth/register");

    if (status === 401 && !isLoginOrRegister) {
      const { useAuthStore } = await import("@/features/auth/store");
      useAuthStore.getState().clearAuth();
      toast.error(i18n.t("toasts.sessionExpired"));
      if (navigateToLogin) navigateToLogin();
      else window.location.assign("/login");
    } else if (status === 403) {
      toast.error(i18n.t("toasts.forbidden"));
    } else if (status && status >= 500) {
      toast.error(i18n.t("toasts.serverError"));
    } else if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      toast.error(i18n.t("toasts.networkError"));
    }

    const message = serverMsg ?? error.message ?? i18n.t("toasts.requestFailed");
    return Promise.reject(new Error(message));
  },
);

/**
 * Typed JSON request with Zod validation of successful JSON body.
 * Backend returns plain JSON (not always `{ data: T }`); we validate `response.data`.
 */
export async function apiRequest<T>(schema: z.ZodType<T>, config: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.request(config);
  return schema.parse(res.data);
}

export async function apiRequestUnchecked<T = unknown>(config: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.request<T>(config);
  return res.data as T;
}
