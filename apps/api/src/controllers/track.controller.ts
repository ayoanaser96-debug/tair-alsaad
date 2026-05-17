import type { Request, Response } from 'express';

import { DriverModel } from '../models/Driver.js';
import { ShipmentModel } from '../models/Shipment.js';
import { UserModel } from '../models/User.js';

import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk } from '../utils/apiResponse.js';
import { NotFoundError } from '../utils/httpError.js';

function firstToken(name?: string): string | undefined {
  if (!name) return undefined;
  return name.trim().split(/\s+/)[0];
}

export const publicTrackingController = asyncHandler(async (req: Request, res: Response) => {
  const code = String(req.params.trackingCode).trim().toUpperCase();
  const shipment = await ShipmentModel.findOne({ trackingCode: code }).lean();

  if (!shipment) {
    throw new NotFoundError('TRACKING_NOT_FOUND', 'رمز غير معروف', 'Tracking code not recognized.');
  }

  let driverPayload: Record<string, unknown> | undefined;
  let driverLocation: { lat: number; lng: number; at?: string } | undefined;

  if (shipment.driverId) {
    const driverDoc = await DriverModel.findById(shipment.driverId).lean();
    if (driverDoc?.userId) {
      const userDriver = await UserModel.findById(driverDoc.userId).lean();
      if (userDriver && driverDoc.vehicle) {
        driverPayload = {
          firstName: firstToken(userDriver.name),
          photoUrl: userDriver.avatarUrl,
          rating: userDriver.rating,
          vehicle: driverDoc.vehicle,
        };

        const loc = driverDoc.currentLocation;
        const lat = loc?.lat;
        const lng = loc?.lng;
        if (typeof lat === 'number' && Number.isFinite(lat) && typeof lng === 'number' && Number.isFinite(lng)) {
          driverLocation = {
            lat,
            lng,
            at: loc?.updatedAt ? new Date(loc.updatedAt).toISOString() : undefined,
          };
        }
      }
    }
  }

  sendOk(res, {
    shipmentId: shipment._id?.toString(),
    status: shipment.status,
    trackingCode: shipment.trackingCode,
    pickupCity: shipment.pickup.city,
    pickupLocation: shipment.pickup?.location ?? undefined,
    dropoffCity: shipment.dropoff.city,
    dropoffLocation: shipment.dropoff?.location ?? undefined,
    receiver: {
      firstName: firstToken(shipment.receiver.name),
    },
    driver: driverPayload,
    driverLocation,
    etaMinutes: shipment.etaMinutes,
    statusHistory: shipment.statusHistory?.map((h) => ({
      status: h.status,
      at: h.at,
    })),
  });
});
