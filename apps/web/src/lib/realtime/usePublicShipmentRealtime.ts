import { useEffect, useRef } from "react";

import { disconnectPublicShipmentSocket, ensurePublicShipmentSocket } from "@/lib/realtime/socketPublic";

export type DriverLocationEvt = {
  shipmentId: string;
  lat: number;
  lng: number;
  at: string;
};

export function usePublicShipmentRealtime(
  trackingCode: string | undefined,
  onStatus: () => void,
  onDriverMove: (p: DriverLocationEvt) => void,
) {
  const statusRef = useRef(onStatus);
  statusRef.current = onStatus;
  const moveRef = useRef(onDriverMove);
  moveRef.current = onDriverMove;

  useEffect(() => {
    const code = typeof trackingCode === "string" ? trackingCode.trim().toUpperCase() : "";
    if (!code) return;

    const socket = ensurePublicShipmentSocket();

    const onConnect = (): void => {
      socket.emit("shipment:subscribe", { trackingCode: code });
    };

    const onStatusEvt = (): void => {
      statusRef.current();
    };

    const onDriverEvt = (p: DriverLocationEvt): void => {
      moveRef.current(p);
    };

    socket.on("connect", onConnect);
    if (socket.connected) onConnect();

    socket.on("shipment:status", onStatusEvt);
    socket.on("shipment:driver_location", onDriverEvt);

    return () => {
      socket.off("connect", onConnect);
      socket.off("shipment:status", onStatusEvt);
      socket.off("shipment:driver_location", onDriverEvt);
      disconnectPublicShipmentSocket();
    };
  }, [trackingCode]);
}
