import { useEffect, useRef } from 'react';

import {
  connectPublicShipmentSocket,
  disconnectPublicShipmentSocket,
} from '@/lib/publicShipmentSocket';

export type DriverLocationEvt = {
  shipmentId: string;
  lat: number;
  lng: number;
  at?: string;
};

/** Subscribe to `shipment:*` events for a tracking code without authentication. */
export function usePublicShipmentRealtime(
  trackingCode: string | undefined | null,
  shipmentMongoId: string | undefined | null,
  onRefresh: () => void,
  onDriverMove: (p: DriverLocationEvt) => void,
): void {
  const refreshRef = useRef(onRefresh);
  refreshRef.current = onRefresh;
  const moveRef = useRef(onDriverMove);
  moveRef.current = onDriverMove;
  const sidRef = useRef(shipmentMongoId);
  sidRef.current = shipmentMongoId;

  useEffect(() => {
    const code = typeof trackingCode === 'string' ? trackingCode.trim().toUpperCase() : '';
    if (!code) return;

    const sock = connectPublicShipmentSocket();
    if (!sock) return;

    const onConnect = (): void => {
      sock.emit('shipment:subscribe', { trackingCode: code });
    };

    const onStatusEvt = (): void => {
      refreshRef.current();
    };

    const onDriverEvt = (p: DriverLocationEvt): void => {
      const sid = sidRef.current;
      if (!sid || !p?.shipmentId || p.shipmentId !== sid) return;
      moveRef.current(p);
    };

    sock.on('connect', onConnect);
    if (sock.connected) onConnect();

    sock.on('shipment:status', onStatusEvt);
    sock.on('shipment:driver_assigned', onStatusEvt);
    sock.on('shipment:driver_location', onDriverEvt);

    return () => {
      sock.off('connect', onConnect);
      sock.off('shipment:status', onStatusEvt);
      sock.off('shipment:driver_assigned', onStatusEvt);
      sock.off('shipment:driver_location', onDriverEvt);
      disconnectPublicShipmentSocket();
    };
  }, [trackingCode]);
}
