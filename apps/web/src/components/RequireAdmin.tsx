import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { isAdminRole } from "@/lib/role";

export function RequireAdmin() {
  const { auth } = useAuth();
  if (!auth || !isAdminRole(auth.user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

export function RequireAdminChild({ children }: { children: ReactNode }) {
  const { auth } = useAuth();
  if (!auth || !isAdminRole(auth.user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
