import { DriverModel } from '../models/Driver.js';
import { ShipmentModel } from '../models/Shipment.js';
import { getIo } from '../sockets/io.js';

import { haversineKm } from './geo.js';

const RADIUS_KM = 5;

export async function dispatchPendingShipmentToDrivers(shipmentId: string): Promise<void> {
  const shipment = await ShipmentModel.findById(shipmentId).lean();
  if (!shipment?.pickup?.location || shipment.status !== 'pending') return;

  const pickup = shipment.pickup.location;
  const cityKey = shipment.pickup.city.trim().toLowerCase();

  const candidates = await DriverModel.find({
    status: 'active',
    isOnline: true,
    serviceCities: cityKey,
  }).lean();

  const io = getIo();
  if (!io) return;

  const payload = {
    shipment: {
      _id: shipment._id!.toString(),
      trackingCode: shipment.trackingCode,
      pickup: shipment.pickup,
      dropoff: { city: shipment.dropoff.city, area: shipment.dropoff.area },
      pricing: shipment.pricing,
      etaMinutes: shipment.etaMinutes ?? null,
      service: shipment.service,
    },
  };

  for (const d of candidates) {
    const loc = d.currentLocation;
    if (!loc?.lat || !loc?.lng) continue;
    const dist = haversineKm(pickup, { lat: loc.lat, lng: loc.lng });
    if (dist > RADIUS_KM) continue;
    io.to(`driver:${d._id!.toString()}`).emit('driver:new_request', payload);
  }
}
