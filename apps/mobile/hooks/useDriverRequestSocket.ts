import { useEffect } from 'react';

import type { Shipment } from '@tayralsaad/types';

import { connectDriverIo, getDriverIo } from '@/lib/driverIo';
import { queryClient } from '@/lib/queryClient';
import { driverMongoId, type DriverMe } from '@/queries/driver';
import { mongoId as shipmentMongoId } from '@/queries/shipments';

/** Merge socket `driver:new_request` payloads into the feed cache. */
export function useDriverRequestSocket(driverMongoId?: string | null, lat?: number | null, lng?: number | null) {
  const latLngKey = `${lat ?? ''}:${lng ?? ''}`;

  useEffect(() => {
    if (!driverMongoId || lat === null || lng === null) return;

    connectDriverIo();
    const s = getDriverIo();
    if (!s) return;

    const handler = (payload: { shipment?: unknown }) => {
      const shipment = payload.shipment as Record<string, unknown> | undefined;
      if (!shipment?._id) return;

      queryClient.setQueryData<Shipment[]>(['shipments', 'feed', lat, lng], (prev) => {
        const sid = shipmentMongoId(shipment as unknown as Shipment);
        const list = prev ?? [];
        if (list.some((item) => shipmentMongoId(item) === sid)) return list;
        return [shipment as Shipment, ...list];
      });
    };

    s.on('driver:new_request', handler);

    return () => {
      s.off('driver:new_request', handler);
    };
  }, [driverMongoId, lat, lng, latLngKey]);
}
