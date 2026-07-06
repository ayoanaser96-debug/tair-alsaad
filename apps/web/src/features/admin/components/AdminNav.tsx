import {
  AlertTriangle,
  BarChart3,
  CreditCard,
  Gift,
  LayoutDashboard,
  MapPin,
  Package,
  Percent,
  Radio,
  ScrollText,
  Settings,
  Shield,
  Star,
  Ticket,
  Truck,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

import { FEATURES } from "@/config/features";
import { cn } from "@/lib/utils";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );

export function AdminNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  return (
    <nav className="flex max-h-[calc(100vh-12rem)] flex-col gap-0.5 overflow-y-auto pe-1">
      <NavLink to="/dashboard/admin" end className={linkClass} onClick={onNavigate}>
        <LayoutDashboard className="h-4 w-4 shrink-0" />
        {t("admin.nav.overview")}
      </NavLink>
      <NavLink to="/dashboard/admin/users" className={linkClass} onClick={onNavigate}>
        <Users className="h-4 w-4 shrink-0" />
        {t("admin.nav.users")}
      </NavLink>
      <NavLink to="/dashboard/admin/drivers" className={linkClass} onClick={onNavigate}>
        <Truck className="h-4 w-4 shrink-0" />
        {t("admin.nav.drivers")}
      </NavLink>
      <NavLink to="/dashboard/admin/orders" className={linkClass} onClick={onNavigate}>
        <Package className="h-4 w-4 shrink-0" />
        {t("admin.nav.orders")}
      </NavLink>
      {FEATURES.adminFinance ? (
        <NavLink to="/dashboard/admin/payments" className={linkClass} onClick={onNavigate}>
          <CreditCard className="h-4 w-4 shrink-0" />
          {t("admin.nav.payments")}
        </NavLink>
      ) : null}
      <NavLink to="/dashboard/admin/disputes" className={linkClass} onClick={onNavigate}>
        <AlertTriangle className="h-4 w-4 shrink-0" />
        {t("admin.nav.disputes")}
      </NavLink>
      <NavLink to="/dashboard/admin/reviews" className={linkClass} onClick={onNavigate}>
        <Star className="h-4 w-4 shrink-0" />
        {t("admin.nav.reviews")}
      </NavLink>
      <NavLink to="/dashboard/admin/analytics" className={linkClass} onClick={onNavigate}>
        <BarChart3 className="h-4 w-4 shrink-0" />
        {t("admin.nav.analytics")}
      </NavLink>
      {FEATURES.adminPromotions ? (
        <NavLink to="/dashboard/admin/promotions" className={linkClass} onClick={onNavigate}>
          <Gift className="h-4 w-4 shrink-0" />
          {t("admin.nav.promotions")}
        </NavLink>
      ) : null}
      <NavLink to="/dashboard/admin/service-areas" className={linkClass} onClick={onNavigate}>
        <MapPin className="h-4 w-4 shrink-0" />
        {t("admin.nav.serviceAreas")}
      </NavLink>
      <NavLink to="/dashboard/admin/pricing" className={linkClass} onClick={onNavigate}>
        <Percent className="h-4 w-4 shrink-0" />
        {t("admin.nav.pricing")}
      </NavLink>
      {FEATURES.notifications ? (
        <NavLink to="/dashboard/admin/notifications" className={linkClass} onClick={onNavigate}>
          <Radio className="h-4 w-4 shrink-0" />
          {t("admin.nav.notifications")}
        </NavLink>
      ) : null}
      <NavLink to="/dashboard/admin/audit" className={linkClass} onClick={onNavigate}>
        <ScrollText className="h-4 w-4 shrink-0" />
        {t("admin.nav.audit")}
      </NavLink>
      <NavLink to="/dashboard/admin/roles" className={linkClass} onClick={onNavigate}>
        <Shield className="h-4 w-4 shrink-0" />
        {t("admin.nav.roles")}
      </NavLink>
      <NavLink to="/dashboard/admin/settings" className={linkClass} onClick={onNavigate}>
        <Settings className="h-4 w-4 shrink-0" />
        {t("admin.nav.settings")}
      </NavLink>
      <NavLink to="/dashboard/admin/support" className={linkClass} onClick={onNavigate}>
        <Ticket className="h-4 w-4 shrink-0" />
        {t("admin.nav.support")}
      </NavLink>
    </nav>
  );
}
