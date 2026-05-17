import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuthStore } from "@/features/auth/store";
import { RequireAuth } from "@/components/RequireAuth";

type Role = "ADMIN" | "SENDER" | "DRIVER";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}

export function RoleGuard({ role, children }: { role: Role; children: ReactNode }) {
  const r = useAuthStore((s) => s.user?.role);
  if (!r) {
    return <Navigate to="/login" replace />;
  }
  if (r !== role) {
    const to =
      r === "ADMIN" ? "/dashboard/admin" : r === "DRIVER" ? "/dashboard/driver" : r === "SENDER" ? "/dashboard/sender" : "/login";
    return <Navigate to={to} replace />;
  }
  return <>{children}</>;
}
