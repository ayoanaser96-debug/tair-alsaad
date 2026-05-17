import type { Request, Response } from 'express';

import { CityModel } from '../models/City.js';
import { DriverModel } from '../models/Driver.js';
import { PayoutBatchModel } from '../models/PayoutBatch.js';
import { ShipmentModel } from '../models/Shipment.js';
import { UserModel } from '../models/User.js';

import { sendOk } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/httpError.js';

export const adminOverviewController = asyncHandler(async (_req: Request, res: Response) => {
  const startDay = new Date();
  startDay.setHours(0, 0, 0, 0);

  const inFlightStatuses = [
    'assigned',
    'arrived_pickup',
    'picked_up',
    'in_transit',
    'arrived_dropoff',
  ];

  const [
    totalUsers,
    totalDrivers,
    pendingDrivers,
    pendingShipments,
    activeDrivers,
    disputedOpen,
    shipmentsInFlight,
    completedToday,
    gmvRows,
    recentShipments,
  ] = await Promise.all([
    UserModel.countDocuments(),
    DriverModel.countDocuments(),
    DriverModel.countDocuments({ status: 'pending_review' }),
    ShipmentModel.countDocuments({ status: 'pending' }),
    DriverModel.countDocuments({ isOnline: true, status: 'active' }),
    ShipmentModel.countDocuments({ status: 'disputed', 'dispute.resolved': false }),
    ShipmentModel.countDocuments({ status: { $in: inFlightStatuses } }),
    ShipmentModel.countDocuments({ status: 'delivered', updatedAt: { $gte: startDay } }),
    ShipmentModel.aggregate<{ sum?: number }>([
      {
        $match: {
          status: 'delivered',
          updatedAt: { $gte: startDay },
        },
      },
      { $group: { _id: null, sum: { $sum: '$pricing.total' } } },
    ]),
    ShipmentModel.find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .select({ trackingCode: 1, status: 1, updatedAt: 1, pickup: 1, dropoff: 1, pricing: 1 })
      .lean(),
  ]);

  sendOk(res, {
    totalUsers,
    totalDrivers,
    pendingDrivers,
    pendingShipments,
    onlineDrivers: activeDrivers,
    openDisputes: disputedOpen,
    shipmentsInFlight,
    completedToday,
    gmvToday: typeof gmvRows[0]?.sum === 'number' ? Math.round(gmvRows[0]!.sum) : 0,
    recentShipments,
  });
});

export const adminUsersListController = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 30);
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    UserModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select({ name: 1, phone: 1, role: 1, createdAt: 1 })
      .lean(),
    UserModel.countDocuments(),
  ]);

  sendOk(res, {
    items: rows.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      phone: u.phone,
      role: u.role,
      createdAt: u.createdAt,
    })),
    total,
  });
});

export const adminDriversListController = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = {};
  if (typeof req.query.status === 'string' && req.query.status.trim()) {
    filter.status = req.query.status;
  }

  const [items, total] = await Promise.all([
    DriverModel.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name phone avatarUrl preferredLanguage rating')
      .lean(),
    DriverModel.countDocuments(filter),
  ]);
  sendOk(res, { items, total });
});

export const adminDriverStatusController = asyncHandler(async (req: Request, res: Response) => {
  const driver = await DriverModel.findById(req.params.id);
  if (!driver) throw new NotFoundError();

  driver.status = req.body.status;
  if (req.body.reason) {
    req.logger.warn({ driverId: driver.id, reason: req.body.reason }, '[admin] driver status change');
  }
  await driver.save();
  sendOk(res, driver);
});

export const adminShipmentsController = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = {};
  if (typeof req.query.status === 'string' && req.query.status.trim()) filter.status = req.query.status;
  if (typeof req.query.city === 'string' && req.query.city.trim()) {
    filter['pickup.city'] = req.query.city.trim().toLowerCase();
  }
  if (typeof req.query.trackingCode === 'string' && req.query.trackingCode.trim()) {
    filter.trackingCode = req.query.trackingCode.trim().toUpperCase();
  }

  const [items, total] = await Promise.all([
    ShipmentModel.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
    ShipmentModel.countDocuments(filter),
  ]);
  sendOk(res, { items, total });
});

export const adminCitiesController = asyncHandler(async (_req: Request, res: Response) => {
  const cities = await CityModel.find().lean();
  sendOk(res, cities);
});

export const adminCityPatchController = asyncHandler(async (req: Request, res: Response) => {
  const city = await CityModel.findById(req.params.id);
  if (!city) throw new NotFoundError();

  Object.assign(city, req.body);
  await city.save();
  sendOk(res, city);
});

export const adminDisputesListController = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = { status: 'disputed', dispute: { $exists: true } };
  if (req.query.status === 'open') {
    filter['dispute.resolved'] = false;
  }
  if (req.query.status === 'resolved') {
    filter['dispute.resolved'] = true;
  }

  const [items, total] = await Promise.all([
    ShipmentModel.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
    ShipmentModel.countDocuments(filter),
  ]);
  sendOk(res, { items, total });
});

export const adminDisputeResolveController = asyncHandler(async (req: Request, res: Response) => {
  const shipment = await ShipmentModel.findById(req.params.id);
  if (!shipment?.dispute) throw new NotFoundError();

  shipment.dispute.resolution = req.body.resolution;
  shipment.dispute.refundAmount = req.body.refundAmount;
  shipment.dispute.resolved = true;
  shipment.dispute.resolvedAt = new Date();

  if (typeof req.body.refundAmount === 'number' && req.body.refundAmount > 0) {
    shipment.payment.status = 'refunded';
  }

  await shipment.save();
  sendOk(res, shipment);
});

export const adminPayoutListController = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = {};

  const [items, total] = await Promise.all([
    PayoutBatchModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    PayoutBatchModel.countDocuments(filter),
  ]);
  sendOk(res, { items, total });
});

export const adminPayoutProcessController = asyncHandler(async (req: Request, res: Response) => {
  const payout = await PayoutBatchModel.findById(req.params.id);
  if (!payout) throw new NotFoundError();
  payout.status = 'completed';
  payout.reference = req.body.reference;
  payout.processedAt = new Date();
  await payout.save();
  sendOk(res, payout);
});
