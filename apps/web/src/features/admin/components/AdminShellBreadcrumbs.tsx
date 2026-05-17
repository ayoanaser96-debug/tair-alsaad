import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { ADMIN_DASHBOARD_BASE, getAdminNavKeyFromPath } from "@/features/admin/adminShellPaths";

export function AdminShellBreadcrumbs() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navKey = getAdminNavKeyFromPath(pathname);
  if (!navKey) return null;

  const pageLabel = t(`admin.nav.${navKey}`);

  return (
    <nav aria-label={t("admin.shell.breadcrumbAria")} className="mb-4">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <li>
          <Link to={ADMIN_DASHBOARD_BASE} className="hover:text-foreground">
            {t("admin.shell.breadcrumbHome")}
          </Link>
        </li>
        <li aria-hidden className="select-none text-border">
          {t("admin.shell.breadcrumbSep")}
        </li>
        <li className="font-medium text-foreground" aria-current="page">
          {pageLabel}
        </li>
      </ol>
    </nav>
  );
}
