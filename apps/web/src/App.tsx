import { Suspense, lazy, type ComponentType, type LazyExoticComponent } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { FEATURES } from "@/config/features";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import { RequireAdmin } from "@/components/RequireAdmin";
import { RequireAuth } from "@/components/RequireAuth";
import { RequireDriver } from "@/components/RequireDriver";
import { RequireSender } from "@/components/RequireSender";

/** Wrap a named export in the shape React.lazy expects (default export). */
function lazyNamed<M, K extends keyof M>(
  loader: () => Promise<M>,
  name: K,
): LazyExoticComponent<ComponentType<Record<string, never>>> {
  return lazy(() =>
    loader().then((mod) => ({ default: mod[name] as unknown as ComponentType<Record<string, never>> })),
  );
}

// Route-level code splitting: each group loads on demand so a first-time sender
// never downloads the admin/driver bundles (and vice versa).
const LoginPage = lazyNamed(() => import("@/pages/LoginPage"), "LoginPage");
const NotFoundPage = lazyNamed(() => import("@/pages/NotFoundPage"), "NotFoundPage");
const DashboardLayout = lazyNamed(() => import("@/pages/DashboardLayout"), "DashboardLayout");
const DashboardRoleRedirect = lazyNamed(() => import("@/pages/DashboardRoleRedirect"), "DashboardRoleRedirect");
const DevComponentsPage = lazyNamed(() => import("@/pages/DevComponentsPage"), "DevComponentsPage");
const DevHealthPage = lazyNamed(() => import("@/pages/DevHealthPage"), "DevHealthPage");

const PublicTrackPage = lazy(() => import("@/pages/public/PublicTrackPage"));
const TrackLandingPage = lazy(() => import("@/pages/public/TrackLandingPage"));

const AdminAnalyticsPage = lazyNamed(() => import("@/features/admin/pages"), "AdminAnalyticsPage");
const AdminAuditPage = lazyNamed(() => import("@/features/admin/pages"), "AdminAuditPage");
const AdminDisputesPage = lazyNamed(() => import("@/features/admin/pages"), "AdminDisputesPage");
const AdminDriversPage = lazyNamed(() => import("@/features/admin/pages"), "AdminDriversPage");
const AdminNotificationsPage = lazyNamed(() => import("@/features/admin/pages"), "AdminNotificationsPage");
const AdminOrdersPage = lazyNamed(() => import("@/features/admin/pages"), "AdminOrdersPage");
const AdminOverviewPage = lazyNamed(() => import("@/features/admin/pages"), "AdminOverviewPage");
const AdminPaymentsPage = lazyNamed(() => import("@/features/admin/pages"), "AdminPaymentsPage");
const AdminPricingPage = lazyNamed(() => import("@/features/admin/pages"), "AdminPricingPage");
const AdminPromotionsPage = lazyNamed(() => import("@/features/admin/pages"), "AdminPromotionsPage");
const AdminReviewsPage = lazyNamed(() => import("@/features/admin/pages"), "AdminReviewsPage");
const AdminRolesPage = lazyNamed(() => import("@/features/admin/pages"), "AdminRolesPage");
const AdminServiceAreasPage = lazyNamed(() => import("@/features/admin/pages"), "AdminServiceAreasPage");
const AdminSettingsPage = lazyNamed(() => import("@/features/admin/pages"), "AdminSettingsPage");
const AdminSupportPage = lazyNamed(() => import("@/features/admin/pages"), "AdminSupportPage");
const AdminUsersPage = lazyNamed(() => import("@/features/admin/pages"), "AdminUsersPage");

const DriverDashboardPage = lazyNamed(() => import("@/pages/driver/DriverDashboardPage"), "DriverDashboardPage");
const DriverRatingsPage = lazyNamed(() => import("@/pages/driver/DriverRatingsPage"), "DriverRatingsPage");
const DriverSettingsPage = lazyNamed(() => import("@/pages/driver/DriverSettingsPage"), "DriverSettingsPage");
const DriverShell = lazyNamed(() => import("@/pages/driver/DriverShell"), "DriverShell");
const DriverSupportPage = lazyNamed(() => import("@/pages/driver/DriverSupportPage"), "DriverSupportPage");
const DriverVehiclePage = lazyNamed(() => import("@/pages/driver/DriverVehiclePage"), "DriverVehiclePage");

const SenderAddressesPage = lazyNamed(() => import("@/pages/sender/SenderAddressesPage"), "SenderAddressesPage");
const SenderCreateOrderPage = lazyNamed(() => import("@/pages/sender/SenderCreateOrderPage"), "SenderCreateOrderPage");
const SenderDashboardPage = lazyNamed(() => import("@/pages/sender/SenderDashboardPage"), "SenderDashboardPage");
const SenderPaymentsPage = lazyNamed(() => import("@/pages/sender/SenderPaymentsPage"), "SenderPaymentsPage");
const SenderSettingsPage = lazyNamed(() => import("@/pages/sender/SenderSettingsPage"), "SenderSettingsPage");
const SenderShell = lazyNamed(() => import("@/pages/sender/SenderShell"), "SenderShell");
const SenderSupportPage = lazyNamed(() => import("@/pages/sender/SenderSupportPage"), "SenderSupportPage");

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export default function App() {
  return (
    <RouteErrorBoundary>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/track" element={<TrackLandingPage />} />
          <Route path="/track/:trackingCode" element={<PublicTrackPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardRoleRedirect />} />
            {import.meta.env.DEV ? (
              <>
                <Route path="dev/components" element={<DevComponentsPage />} />
                <Route path="dev/health" element={<DevHealthPage />} />
              </>
            ) : null}
            <Route path="admin" element={<RequireAdmin />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="drivers" element={<AdminDriversPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              {FEATURES.adminFinance ? <Route path="payments" element={<AdminPaymentsPage />} /> : null}
              <Route path="disputes" element={<AdminDisputesPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              {FEATURES.adminPromotions ? <Route path="promotions" element={<AdminPromotionsPage />} /> : null}
              <Route path="service-areas" element={<AdminServiceAreasPage />} />
              <Route path="pricing" element={<AdminPricingPage />} />
              {FEATURES.notifications ? <Route path="notifications" element={<AdminNotificationsPage />} /> : null}
              <Route path="audit" element={<AdminAuditPage />} />
              <Route path="roles" element={<AdminRolesPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="support" element={<AdminSupportPage />} />
            </Route>
            <Route
              path="driver"
              element={
                <RequireDriver>
                  <DriverShell />
                </RequireDriver>
              }
            >
              <Route index element={<DriverDashboardPage />} />
              <Route path="vehicle" element={<DriverVehiclePage />} />
              <Route path="ratings" element={<DriverRatingsPage />} />
              <Route path="support" element={<DriverSupportPage />} />
              <Route path="settings" element={<DriverSettingsPage />} />
            </Route>
            <Route
              path="sender"
              element={
                <RequireSender>
                  <SenderShell />
                </RequireSender>
              }
            >
              <Route index element={<SenderDashboardPage />} />
              <Route path="orders" element={<SenderDashboardPage />} />
              <Route path="create" element={<SenderCreateOrderPage />} />
              <Route path="addresses" element={<SenderAddressesPage />} />
              {FEATURES.paymentMethods ? <Route path="payments" element={<SenderPaymentsPage />} /> : null}
              <Route path="support" element={<SenderSupportPage />} />
              <Route path="settings" element={<SenderSettingsPage />} />
            </Route>
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </RouteErrorBoundary>
  );
}
