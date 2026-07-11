import { create } from 'zustand';

import type { ApiUser } from '@/lib/types';
import type { AppHomeSegment } from '@/lib/secure';
import { revokeServerSession } from '@/lib/authSession';
import { sanitizeAppHomeSegment } from '@/lib/resolveDashboard';
import {
  clearTokens,
  clearAppHomeSegment,
  loadAppHomeSegment,
  loadHydratedAuth,
  persistAppHomeSegment,
  persistAuth,
} from '@/lib/secure';

type AuthState = {
  hydrated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: ApiUser | null;
  appHomeSegment: AppHomeSegment | null;
  hydrate: () => Promise<void>;
  /** Replace session after OTP / refresh bootstrap. */
  setSession: (params: {
    accessToken: string;
    refreshToken: string;
    user: ApiUser;
    /** Omit home segment until post-login role picker when `clearHome` is true. */
    initialShell?: AppHomeSegment;
    /** Clear persisted dashboard shell (OTP → role selection flow). */
    clearHome?: boolean;
  }) => Promise<void>;
  updateTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setUser: (user: ApiUser) => Promise<void>;
  setAppHomeSegment: (segment: AppHomeSegment) => Promise<void>;
  /** Alias for `setAppHomeSegment` — persists chosen dashboard role. */
  setRole: (segment: AppHomeSegment) => Promise<void>;
  /** Clears persisted dashboard shell so user picks role again (switch dashboard). */
  clearDashboardShell: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  hydrated: false,
  accessToken: null,
  refreshToken: null,
  user: null,
  appHomeSegment: null,

  hydrate: async () => {
    const [saved, homeRaw] = await Promise.all([loadHydratedAuth(), loadAppHomeSegment()]);
    const apiRole = String(saved.user?.role ?? '').toLowerCase();
    const home = sanitizeAppHomeSegment(apiRole, homeRaw);
    if (homeRaw !== home) {
      if (home) {
        await persistAppHomeSegment(home);
      } else {
        await clearAppHomeSegment();
      }
    }
    set({
      accessToken: saved.accessToken ?? null,
      refreshToken: saved.refreshToken ?? null,
      user: saved.user ?? null,
      appHomeSegment: home,
      hydrated: true,
    });
  },

  setSession: async ({ accessToken, refreshToken, user, initialShell = 'sender', clearHome }) => {
    await persistAuth({ accessToken, refreshToken, user });
    if (clearHome) {
      await clearAppHomeSegment();
      set({
        accessToken,
        refreshToken,
        user,
        hydrated: true,
        appHomeSegment: null,
      });
      return;
    }
    await persistAppHomeSegment(initialShell);
    set({
      accessToken,
      refreshToken,
      user,
      hydrated: true,
      appHomeSegment: initialShell,
    });
  },

  updateTokens: async (accessToken, refreshToken) => {
    const { user } = get();
    if (user) {
      await persistAuth({ accessToken, refreshToken, user });
    }
    set({ accessToken, refreshToken });
  },

  setUser: async (user) => {
    const { accessToken, refreshToken } = get();
    if (accessToken && refreshToken) await persistAuth({ accessToken, refreshToken, user });
    set({ user });
  },

  setAppHomeSegment: async (segment) => {
    await persistAppHomeSegment(segment);
    set({ appHomeSegment: segment });
  },

  setRole: async (segment) => {
    await persistAppHomeSegment(segment);
    set({ appHomeSegment: segment });
  },

  clearDashboardShell: async () => {
    await clearAppHomeSegment();
    set({ appHomeSegment: null });
  },

  logout: async () => {
    await revokeServerSession();
    await clearTokens().catch(() => undefined);
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      appHomeSegment: null,
      hydrated: true,
    });
  },
}));
