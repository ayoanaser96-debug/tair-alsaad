import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";

import { canAccessPage, getAdminSubRole, type AdminPageKey } from "@/features/admin/permissions";

export function PermissionGate({ page, children }: { page: AdminPageKey; children: ReactNode }) {
  const { t } = useTranslation();
  const role = getAdminSubRole();
  if (!canAccessPage(page, role)) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <p className="font-semibold">{t("admin.permissionDenied")}</p>
        <p className="text-sm text-amber-900/90">{t("admin.permissionDeniedBody", { role })}</p>
      </div>
    );
  }
  return <>{children}</>;
}

export function RequirePermissionRoute({ page, children }: { page: AdminPageKey; children: ReactNode }) {
  const role = getAdminSubRole();
  if (!canAccessPage(page, role)) {
    return <Navigate to="/dashboard/admin" replace />;
  }
  return <>{children}</>;
}
