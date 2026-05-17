import { Navigate, Route, Routes } from "react-router-dom";

import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import { RequireAdmin } from "@/components/RequireAdmin";
import { RequireAuth } from "@/components/RequireAuth";
import { RequireDriver } from "@/components/RequireDriver";
import { RequireSender } from "@/components/RequireSender";
import {
  AdminAnalyticsPage,
  AdminAuditPage,
  AdminDisputesPage,
  AdminDriversPage,
  AdminNotificationsPage,
  AdminOrdersPage,
  AdminOverviewPage,
  AdminPaymentsPage,
  AdminPricingPage,
  AdminPromotionsPage,
  AdminReviewsPage,
  AdminRolesPage,
  AdminServiceAreasPage,
  AdminSettingsPage,
  AdminSupportPage,
  AdminUsersPage,
} from "@/features/admin/pages";
import { DashboardLayout } from "@/pages/DashboardLayout";
import { DashboardRoleRedirect } from "@/pages/DashboardRoleRedirect";
import { DevComponentsPage } from "@/pages/DevComponentsPage";
import { DevHealthPage } from "@/pages/DevHealthPage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { DriverDashboardPage } from "@/pages/driver/DriverDashboardPage";
import { DriverRatingsPage } from "@/pages/driver/DriverRatingsPage";
import { DriverSettingsPage } from "@/pages/driver/DriverSettingsPage";
import { DriverShell } from "@/pages/driver/DriverShell";
import { DriverSupportPage } from "@/pages/driver/DriverSupportPage";
import { DriverVehiclePage } from "@/pages/driver/DriverVehiclePage";
import { SenderAddressesPage } from "@/pages/sender/SenderAddressesPage";
import { SenderCreateOrderPage } from "@/pages/sender/SenderCreateOrderPage";
import { SenderDashboardPage } from "@/pages/sender/SenderDashboardPage";
import { SenderPaymentsPage } from "@/pages/sender/SenderPaymentsPage";
import { SenderSettingsPage } from "@/pages/sender/SenderSettingsPage";
import { SenderShell } from "@/pages/sender/SenderShell";
import { SenderSupportPage } from "@/pages/sender/SenderSupportPage";
import PublicTrackPage from "@/pages/public/PublicTrackPage";
import TrackLandingPage from "@/pages/public/TrackLandingPage";

export default function App() {
  return (
    <RouteErrorBoundary>
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
        <Route path="dev/components" element={<DevComponentsPage />} />
        <Route path="dev/health" element={<DevHealthPage />} />
        <Route path="admin" element={<RequireAdmin />}>
          <Route index element={<AdminOverviewPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="drivers" element={<AdminDriversPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="disputes" element={<AdminDisputesPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="promotions" element={<AdminPromotionsPage />} />
          <Route path="service-areas" element={<AdminServiceAreasPage />} />
          <Route path="pricing" element={<AdminPricingPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
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
          <Route path="payments" element={<SenderPaymentsPage />} />
          <Route path="support" element={<SenderSupportPage />} />
          <Route path="settings" element={<SenderSettingsPage />} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </RouteErrorBoundary>
  );
}
