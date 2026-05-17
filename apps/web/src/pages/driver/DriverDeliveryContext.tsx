import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import type { ActiveDelivery, AvailableOffer, DeliveryStep } from "@/pages/driver/driverMock";
import { MOCK_ACTIVE_DELIVERY } from "@/pages/driver/driverMock";

const STEPS: DeliveryStep[] = [
  "navigate_pickup",
  "arrived_pickup",
  "picked_up",
  "navigate_delivery",
  "arrived_delivery",
  "delivered",
];

function offerToActive(o: AvailableOffer): ActiveDelivery {
  return {
    id: o.id,
    trackingCode: `SW-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    pickupLabel: o.pickupLabel,
    dropLabel: o.dropLabel,
    senderName: o.senderName,
    senderPhone: "+60120000000",
    recipientName: "Recipient",
    recipientPhone: "+60130000000",
    packageType: o.packageType,
    earnings: o.estimatedEarnings,
    currency: o.currency,
    currentStep: "navigate_pickup",
  };
}

type Ctx = {
  delivery: ActiveDelivery | null;
  advanceStep: () => void;
  setStep: (s: DeliveryStep) => void;
  clearDelivery: () => void;
  startFromOffer: (o: AvailableOffer) => void;
  setDelivery: (d: ActiveDelivery | null) => void;
};

const DriverDeliveryContext = createContext<Ctx | null>(null);

export function DriverDeliveryProvider({ children }: { children: ReactNode }) {
  const [delivery, setDelivery] = useState<ActiveDelivery | null>(MOCK_ACTIVE_DELIVERY);

  const advanceStep = useCallback(() => {
    setDelivery((d) => {
      if (!d) return d;
      const i = STEPS.indexOf(d.currentStep);
      if (i < 0 || i >= STEPS.length - 1) return d;
      return { ...d, currentStep: STEPS[i + 1]! };
    });
  }, []);

  const setStep = useCallback((step: DeliveryStep) => {
    setDelivery((d) => (d ? { ...d, currentStep: step } : d));
  }, []);

  const clearDelivery = useCallback(() => setDelivery(null), []);

  const startFromOffer = useCallback((o: AvailableOffer) => {
    setDelivery(offerToActive(o));
  }, []);

  const value = useMemo(
    () => ({
      delivery,
      advanceStep,
      setStep,
      clearDelivery,
      startFromOffer,
      setDelivery,
    }),
    [delivery, advanceStep, setStep, clearDelivery, startFromOffer],
  );

  return <DriverDeliveryContext.Provider value={value}>{children}</DriverDeliveryContext.Provider>;
}

export function useActiveDelivery() {
  const ctx = useContext(DriverDeliveryContext);
  if (!ctx) throw new Error("useActiveDelivery must be used within DriverDeliveryProvider");
  return ctx;
}
