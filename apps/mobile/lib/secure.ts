import * as SecureStore from 'expo-secure-store';

import { normalizeUser } from './types';

import type { ApiUser } from './types';

const STORAGE_ACCESS = 'tayralsaad_access';
const STORAGE_REFRESH = 'tayralsaad_refresh';
const STORAGE_USER = 'tayralsaad_user';
const STORAGE_APP_HOME = 'tayralsaad_app_home';
export const LOCALE_KEY = 'tayralsaad_locale';

/** Last dashboard shell after login (includes receiver inbox UI). */
export type AppHomeSegment = 'sender' | 'receiver' | 'driver' | 'admin';

export async function loadAppHomeSegment(): Promise<AppHomeSegment | null> {
  const raw = await SecureStore.getItemAsync(STORAGE_APP_HOME);
  if (raw === 'sender' || raw === 'receiver' || raw === 'driver' || raw === 'admin') return raw;
  return null;
}

export async function persistAppHomeSegment(segment: AppHomeSegment): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_APP_HOME, segment);
}

export async function clearAppHomeSegment(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_APP_HOME).catch(() => undefined);
}

export type PersistedAuth = {
  accessToken: string | null;
  refreshToken: string | null;
  user: ApiUser | null;
};

export async function loadHydratedAuth(): Promise<PersistedAuth> {
  const [accessToken, refreshToken, userRaw] = await Promise.all([
    SecureStore.getItemAsync(STORAGE_ACCESS),
    SecureStore.getItemAsync(STORAGE_REFRESH),
    SecureStore.getItemAsync(STORAGE_USER),
  ]);

  if (!accessToken || !refreshToken || !userRaw) {
    return { accessToken: accessToken ?? null, refreshToken: refreshToken ?? null, user: null };
  }

  try {
    const parsed = JSON.parse(userRaw) as Record<string, unknown>;
    const user = normalizeUser(parsed);
    return { accessToken, refreshToken, user };
  } catch {
    return { accessToken, refreshToken, user: null };
  }
}

export async function persistAuth(state: PersistedAuth): Promise<void> {
  if (!state.accessToken || !state.refreshToken || !state.user) return;
  await Promise.all([
    SecureStore.setItemAsync(STORAGE_ACCESS, state.accessToken),
    SecureStore.setItemAsync(STORAGE_REFRESH, state.refreshToken),
    SecureStore.setItemAsync(STORAGE_USER, JSON.stringify(state.user)),
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(STORAGE_ACCESS),
    SecureStore.deleteItemAsync(STORAGE_REFRESH),
    SecureStore.deleteItemAsync(STORAGE_USER),
    SecureStore.deleteItemAsync(STORAGE_APP_HOME),
  ]).catch(() => undefined);
}

export async function getStoredLocale(): Promise<'ar' | 'en' | null> {
  const v = await SecureStore.getItemAsync(LOCALE_KEY);
  if (v === 'ar' || v === 'en') return v;
  return null;
}

export async function setStoredLocale(lng: 'ar' | 'en'): Promise<void> {
  await SecureStore.setItemAsync(LOCALE_KEY, lng);
}
