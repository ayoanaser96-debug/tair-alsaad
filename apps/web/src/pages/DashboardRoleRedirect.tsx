import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { toDashboardRole } from "@/lib/role";

export function DashboardRoleRedirect() {
  const { t } = useTranslation();
  const { auth } = useAuth();
  if (!auth) return null;
  switch (toDashboardRole(auth.user.role)) {
    case "ADMIN":
      return <Navigate to="/dashboard/admin" replace />;
    case "DRIVER":
      return <Navigate to="/dashboard/driver" replace />;
    case "SENDER":
      return <Navigate to="/dashboard/sender" replace />;
    default:
      return <p className="text-muted-foreground">{t("dashboard.unknownRole")}</p>;
  }
}
