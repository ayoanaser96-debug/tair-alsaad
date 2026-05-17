import { getIo } from './io.js';

export function broadcastShipmentRoom(event: string, shipmentId: string, payload: unknown) {
  getIo()?.to(`shipment:${shipmentId}`).emit(event, payload);
}

export function emitShipmentStatus(shipmentId: string, status: string, at = new Date()) {
  broadcastShipmentRoom('shipment:status', shipmentId, {
    shipmentId,
    status,
    at: at.toISOString(),
  });
}

export function emitDriverAssigned(shipmentId: string, driver: Record<string, unknown>) {
  broadcastShipmentRoom('shipment:driver_assigned', shipmentId, { shipmentId, driver });
}

export function emitShipmentEta(shipmentId: string, etaMinutes: number) {
  broadcastShipmentRoom('shipment:eta', shipmentId, { shipmentId, etaMinutes });
}
