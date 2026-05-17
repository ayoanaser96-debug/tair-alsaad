import type { Address, PackageType, PaymentMethod, QuoteResponse, ServiceTier, WeightTier } from '@tayralsaad/types';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type DraftShipmentPackage = {
  type: PackageType;
  weightTier: WeightTier;
  description?: string;
  declaredValue?: number;
};

export type DraftReceiver = {
  name: string;
  phone: string;
};

/** Bagdad default — map centers here until pins move. */
const DEFAULT_CENTER = { lat: 33.3152, lng: 44.3661 };

/** Strip persisted-only fields before storing in shipment draft payload. */
function toDraftAddress(addr: Address): Address {
  return {
    city: String(addr.city ?? '').trim().toLowerCase(),
    area: String(addr.area ?? '').trim(),
    location: addr.location,
    ...(addr.label ? { label: addr.label } : {}),
    ...(addr.street ? { street: addr.street } : {}),
    ...(addr.building ? { building: addr.building } : {}),
    ...(addr.notes ? { notes: addr.notes } : {}),
  };
}

function emptyAddress(overrides: Partial<Address> & Pick<Address, 'city' | 'area'>): Address {
  return {
    city: overrides.city.toLowerCase().trim(),
    area: overrides.area.trim(),
    location: overrides.location ?? { ...DEFAULT_CENTER },
    ...(overrides.label ? { label: overrides.label } : {}),
    ...(overrides.street ? { street: overrides.street } : {}),
    ...(overrides.building ? { building: overrides.building } : {}),
    ...(overrides.notes ? { notes: overrides.notes } : {}),
  };
}

type DraftShipmentStateSlice = {
  pickup: Address;
  dropoff: Address;
  receiver: DraftReceiver;
  package: DraftShipmentPackage;
  service: ServiceTier;
  /** ISO string for JSON persistence when service is scheduled. */
  scheduledForIso: string | null;
  paymentMethod: PaymentMethod;
  lastQuote: QuoteResponse | null;
  quoteErrorCode: string | null;

  patchPickup: (patch: Partial<Address>) => void;
  patchDropoff: (patch: Partial<Address>) => void;
  setReceiver: (receiver: DraftReceiver) => void;
  setPackage: (pkg: DraftShipmentPackage) => void;
  setService: (tier: ServiceTier, scheduledIso: string | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setLastQuote: (q: QuoteResponse | null, errorCode?: string | null) => void;
  applySavedAddressPickup: (addr: Address) => void;
  applySavedAddressDropoff: (addr: Address) => void;
  resetDraft: () => void;
};

const initialDraft = (): Pick<
  DraftShipmentStateSlice,
  'pickup' | 'dropoff' | 'receiver' | 'package' | 'service' | 'scheduledForIso' | 'paymentMethod' | 'lastQuote' | 'quoteErrorCode'
> => {
  const packageDefaults: DraftShipmentPackage = {
    type: 'small',
    weightTier: 'light',
  };
  return {
    pickup: emptyAddress({ city: 'baghdad', area: 'Pickup' }),
    dropoff: emptyAddress({ city: 'baghdad', area: 'Drop-off' }),
    receiver: { name: '', phone: '' },
    package: packageDefaults,
    service: 'standard',
    scheduledForIso: null,
    paymentMethod: 'cash_on_delivery',
    lastQuote: null,
    quoteErrorCode: null,
  };
};

export const useDraftShipmentStore = create<DraftShipmentStateSlice>()(
  persist(
    (set) => ({
      ...initialDraft(),

      patchPickup: (patch) =>
        set((s) => ({
          pickup: {
            ...s.pickup,
            ...patch,
            location: patch.location ?? s.pickup.location,
          },
          quoteErrorCode: null,
        })),

      patchDropoff: (patch) =>
        set((s) => ({
          dropoff: {
            ...s.dropoff,
            ...patch,
            location: patch.location ?? s.dropoff.location,
          },
          quoteErrorCode: null,
        })),

      setReceiver: (receiver) => set({ receiver, quoteErrorCode: null }),

      setPackage: (pkg) =>
        set({
          package: pkg,
          quoteErrorCode: null,
        }),

      setService: (tier, scheduledIso) =>
        set({
          service: tier,
          scheduledForIso: tier === 'scheduled' ? scheduledIso : null,
          quoteErrorCode: null,
        }),

      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

      setLastQuote: (lastQuote, errorCode = null) => set({ lastQuote, quoteErrorCode: errorCode }),

      applySavedAddressPickup: (addr) =>
        set((s) => ({
          pickup: {
            ...toDraftAddress(addr),
            location: addr.location ?? s.pickup.location,
          },
          quoteErrorCode: null,
        })),

      applySavedAddressDropoff: (addr) =>
        set((s) => ({
          dropoff: {
            ...toDraftAddress(addr),
            location: addr.location ?? s.dropoff.location,
          },
          quoteErrorCode: null,
        })),

      resetDraft: () => set({ ...initialDraft() }),
    }),
    {
      name: 'sender-draft-shipment',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        pickup: s.pickup,
        dropoff: s.dropoff,
        receiver: s.receiver,
        package: s.package,
        service: s.service,
        scheduledForIso: s.scheduledForIso,
        paymentMethod: s.paymentMethod,
      }),
    },
  ),
);
