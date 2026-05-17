import type { Request, Response } from 'express';
import mongoose from 'mongoose';

import { DriverModel } from '../models/Driver.js';
import { UserModel } from '../models/User.js';
import { PayoutBatchModel } from '../models/PayoutBatch.js';
import { ShipmentModel } from '../models/Shipment.js';

import { broadcastDriverShipmentLocations } from '../sockets/io.js';

import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk } from '../utils/apiResponse.js';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../utils/httpError.js';

async function propagateDriverPing(driverMongoIdStr: string, lat: number, lng: number) {
  const driverOid = new mongoose.Types.ObjectId(driverMongoIdStr);
  const active = await ShipmentModel.find({
    driverId: driverOid,
    status: { $in: ['assigned', 'arrived_pickup', 'picked_up', 'in_transit', 'arrived_dropoff'] },
  })
    .select({ _id: 1 })
    .lean();

  broadcastDriverShipmentLocations(
    driverMongoIdStr,
    active.map((s) => s._id!.toString()),
    lat,
    lng,
  );
}

export const applyDriver = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new ForbiddenError();
  const existing = await DriverModel.findOne({ userId: req.auth.userId });
  if (existing) {
    existing.set({
      vehicle: req.body.vehicle,
      documents: req.body.documents,
      status: 'pending_review',
    });
    await existing.save();
    sendOk(res, existing);
    return;
  }
  const created = await DriverModel.create({
    userId: req.auth.userId,
    vehicle: req.body.vehicle,
    documents: req.body.documents,
    status: 'pending_review',
    serviceCities: ['baghdad'],
    earnings: {},
  });

  await UserModel.findByIdAndUpdate(req.auth.userId, { role: 'driver' }).exec();

  sendOk(res, created);
});

export const getDriverProfile = asyncHandler(async (req: Request, res: Response) => {
  const driver = await DriverModel.findOne({ userId: req.auth?.userId });
  if (!driver) throw new NotFoundError();
  sendOk(res, driver);
});

export const getActiveShipment = asyncHandler(async (req: Request, res: Response) => {
  const driver = await DriverModel.findOne({ userId: req.auth?.userId });
  if (!driver) throw new NotFoundError();

  const shipment = await ShipmentModel.findOne({
    driverId: driver._id,
    status: { $in: ['assigned', 'arrived_pickup', 'picked_up', 'in_transit', 'arrived_dropoff'] },
  }).sort({ updatedAt: -1 });

  sendOk(res, shipment ?? null);
});

export const toggleOnline = asyncHandler(async (req: Request, res: Response) => {
  const driver = await DriverModel.findOne({ userId: req.auth?.userId });
  if (!driver) throw new NotFoundError();
  driver.isOnline = req.body.isOnline;
  await driver.save();
  sendOk(res, driver);
});

export const postDriverLocation = asyncHandler(async (req: Request, res: Response) => {
  const driver = await DriverModel.findOne({ userId: req.auth?.userId });
  if (!driver) throw new NotFoundError();

  driver.currentLocation = {
    lat: req.body.lat,
    lng: req.body.lng,
    updatedAt: new Date(),
  };
  await driver.save();

  await propagateDriverPing(driver.id, req.body.lat, req.body.lng);

  return res.sendStatus(204);
});

export const getDriverEarnings = asyncHandler(async (req: Request, res: Response) => {
  const driver = await DriverModel.findOne({ userId: req.auth?.userId });
  if (!driver) throw new NotFoundError();

  const available = driver.earnings?.available ?? 0;
  const pendingPayout = driver.earnings?.pendingPayout ?? 0;
  const totalEarned = driver.earnings?.totalEarned ?? 0;

  const recent = await ShipmentModel.find({
    driverId: driver._id,
    status: { $in: ['delivered', 'cancelled', 'disputed'] },
  })
    .sort({ updatedAt: -1 })
    .limit(5)
    .select({ trackingCode: 1, status: 1, pricing: 1 })
    .lean();

  sendOk(res, {
    available,
    pendingPayout,
    totalEarned,
    recent,
  });
});

export const requestPayoutBatch = asyncHandler(async (req: Request, res: Response) => {
  const driver = await DriverModel.findOne({ userId: req.auth?.userId });
  if (!driver) throw new NotFoundError();
  const balance = driver.earnings?.available ?? 0;
  if (balance <= 0) {
    throw new ValidationError('لا يوجد رصيد', 'No payout balance.');
  }

  const amount = balance;

  driver.set('earnings.pendingPayout', (driver.earnings?.pendingPayout ?? 0) + amount);
  driver.set('earnings.available', 0);
  await driver.save();

  const batch = await PayoutBatchModel.create({
    driverId: driver._id,
    shipmentIds: [],
    amount,
    method: 'zaincash',
    status: 'pending',
  });

  req.logger.info({ payoutId: batch.id }, '[payout] batch created');
  sendOk(res, batch, 201);
});
