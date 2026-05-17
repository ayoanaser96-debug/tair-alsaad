import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { fetchMeApi } from "@/features/auth/api";
import { ME_KEY } from "@/features/auth/keys";
import type { AuthResponse, MeUser } from "@/features/auth/schemas";
import { migrateLegacyAuthSession, useAuthStore } from "@/features/auth/store";
import { setAuthNavigate, setTokenGetter } from "@/lib/api/client";
import { connectRealtime, disconnectRealtime } from "@/lib/realtime/socket";

type AuthState = {
  accessToken: string;
  refreshToken: string;
  user: MeUser;
};

type AuthContextValue = {
  ready: boolean;
  auth: AuthState | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [hydrated, setHydrated] = useState(false);

  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const user = useAuthStore((s) => s.user);
  /** Persisted token without user (corrupt storage) — wait for /me or error. */
  const needsProfile = !!accessToken && !user;

  useEffect(() => {
    migrateLegacyAuthSession();
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  useEffect(() => {
    setTokenGetter(() => useAuthStore.getState().accessToken);
    setAuthNavigate(() => navigate("/login", { replace: true }));
  }, [navigate]);

  const meQuery = useQuery({
    queryKey: ME_KEY,
    enabled: hydrated && !!accessToken,
    queryFn: async () => {
      const u = await fetchMeApi();
      useAuthStore.getState().setUser(u);
      return u;
    },
    staleTime: 60_000,
    retry: 1,
  });

  useEffect(() => {
    if (hydrated && accessToken && meQuery.isSuccess) {
      connectRealtime(() => useAuthStore.getState().accessToken);
    }
  }, [hydrated, accessToken, meQuery.isSuccess]);

  const ready = hydrated && (!needsProfile || !meQuery.isPending);

  const resolvedAuth: AuthState | null =
    accessToken && refreshToken && user ? { accessToken, refreshToken, user } : null;

  const logout = useCallback(() => {
    useAuthStore.getState().clearAuth();
    disconnectRealtime();
    void queryClient.clear();
    navigate("/login", { replace: true });
  }, [navigate, queryClient]);

  const login = useCallback(
    (data: AuthResponse) => {
      useAuthStore.getState().setSession(data);
      void queryClient.invalidateQueries({ queryKey: ME_KEY });
    },
    [queryClient],
  );

  const refreshProfile = useCallback(async () => {
    const t = useAuthStore.getState().accessToken;
    if (!t) return;
    try {
      const u = await fetchMeApi();
      useAuthStore.getState().setUser(u);
    } catch {
      logout();
    }
  }, [logout]);

  const value = useMemo(
    () => ({
      ready,
      auth: resolvedAuth,
      login,
      logout,
      refreshProfile,
    }),
    [ready, resolvedAuth, login, logout, refreshProfile],
  );

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-background to-[hsl(35_38%_92%)] text-muted-foreground">
        Loading…
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
