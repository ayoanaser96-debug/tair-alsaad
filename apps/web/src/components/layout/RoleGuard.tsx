import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

export type DashboardRole = "SENDER" | "DRIVER" | "ADMIN";

export type RoleGuardProps = {
  role: DashboardRole;
  children: ReactNode;
  fallbackTo?: string;
};

export function RoleGuard({ role, children, fallbackTo = "/dashboard" }: RoleGuardProps) {
  const { auth } = useAuth();
  if (auth?.user.role !== role) {
    return <Navigate to={fallbackTo} replace />;
  }
  return <>{children}</>;
}
