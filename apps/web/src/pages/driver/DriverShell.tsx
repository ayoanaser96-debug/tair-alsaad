import { Outlet } from "react-router-dom";

import { DriverDeliveryProvider } from "@/pages/driver/DriverDeliveryContext";
import { DriverMobileNav } from "@/pages/driver/DriverMobileNav";
import { DriverStickyDeliveryBar } from "@/pages/driver/DriverStickyDeliveryBar";

export function DriverShell() {
  return (
    <DriverDeliveryProvider>
      <div className="pb-24 md:pb-0">
        <DriverStickyDeliveryBar />
        <Outlet />
      </div>
      <DriverMobileNav />
    </DriverDeliveryProvider>
  );
}
