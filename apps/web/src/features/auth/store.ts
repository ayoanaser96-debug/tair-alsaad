import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AuthResponse, MeUser } from "@/features/auth/schemas";
import { LEGACY_AUTH_STORAGE_KEY } from "@/lib/api/client";

const STORAGE_KEY = "tairalsaad-auth-zustand";

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: MeUser | null;
  setSession: (r: AuthResponse, user?: MeUser | null) => void;
  setUser: (u: MeUser) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: (r, user) =>
        set({
          accessToken: r.accessToken,
          refreshToken: r.refreshToken,
          user: user ?? ({ ...r.user, city: null, wallet: null } as MeUser),
        }),
      setUser: (u) => set({ user: u }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      clearAuth: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        user: s.user,
      }),
    },
  ),
);

/** One-time migration from pre-zustand sessionStorage shape */
export function migrateLegacyAuthSession(): void {
  try {
    const hasNew = sessionStorage.getItem(STORAGE_KEY);
    if (hasNew) return;
    const raw = sessionStorage.getItem(LEGACY_AUTH_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as AuthResponse;
    if (!parsed.accessToken || !parsed.refreshToken) return;
    useAuthStore.getState().setSession(parsed, { ...parsed.user, city: null, wallet: null } as MeUser);
    sessionStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
