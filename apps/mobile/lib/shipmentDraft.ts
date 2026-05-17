import type { Address, PaymentMethod } from '@tayralsaad/types';

import type { DraftReceiver, DraftShipmentPackage } from '@/stores/draftShipmentStore';

type ServiceSlice = 'standard' | 'express' | 'scheduled';

export function scrubCity(city: string): string {
  return city.trim().toLowerCase();
}

export function draftToQuoteBody(input: {
  pickup: Address;
  dropoff: Address;
  package: DraftShipmentPackage;
  service: ServiceSlice;
  scheduledForIso: string | null;
}): Record<string, unknown> | null {
  if (
    !(input.pickup.area?.trim() && input.pickup.city?.trim() && Number.isFinite(input.pickup.location.lat)) ||
    !(input.dropoff.area?.trim() && input.dropoff.city?.trim() && Number.isFinite(input.dropoff.location.lat))
  ) {
    return null;
  }
  if (input.service === 'scheduled' && !input.scheduledForIso) return null;

  const body: Record<string, unknown> = {
    pickup: {
      ...input.pickup,
      city: scrubCity(input.pickup.city),
      area: input.pickup.area.trim(),
    },
    dropoff: {
      ...input.dropoff,
      city: scrubCity(input.dropoff.city),
      area: input.dropoff.area.trim(),
    },
    package: { ...input.package },
    service: input.service,
  };
  if (input.service === 'scheduled' && input.scheduledForIso) {
    body.scheduledFor = input.scheduledForIso;
  }
  return body;
}

export function draftToCreateShipmentBody(input: {
  pickup: Address;
  dropoff: Address;
  package: DraftShipmentPackage;
  service: ServiceSlice;
  scheduledForIso: string | null;
  receiver: DraftReceiver;
  paymentMethod: PaymentMethod;
}): Record<string, unknown> | null {
  const quote = draftToQuoteBody(input);
  if (!quote) return null;
  if (!input.receiver.name.trim()) return null;
  if (!input.receiver.phone.trim()) return null;
  return {
    ...quote,
    receiver: { name: input.receiver.name.trim(), phone: input.receiver.phone.trim() },
    paymentMethod: input.paymentMethod,
  };
}
