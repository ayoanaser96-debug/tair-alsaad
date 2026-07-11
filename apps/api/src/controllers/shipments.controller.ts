import { generateTrackingCode, normalizePhone } from '@tayralsaad/utils';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';

import { DriverModel } from '../models/Driver.js';
import { UserModel } from '../models/User.js';
import { notificationQueue } from '../queues/index.js';
import { ShipmentModel } from '../models/Shipment.js';
import { dispatchPendingShipmentToDrivers } from '../services/dispatchService.js';
import { haversineKm } from '../services/geo.js';
import { enrichShipmentDoc, enrichShipmentDocs } from '../services/shipmentPresenter.js';
import { quoteShipment } from '../services/pricingService.js';
import {
  emitDriverAssigned,
  emitShipmentEta,
  emitShipmentStatus,
} from '../sockets/emitShipment.js';
import { sendOk } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { otpGenerator } from '../utils/otpGenerator.js';
import {
  ConflictError,
  ForbiddenError,
  HttpError,
  NotFoundError,
  ValidationError,
} from '../utils/httpError.js';

function scrubCity<T extends { city: string }>(addr: T): T {
  return { ...addr, city: addr.city.trim().toLowerCase() };
}

function pushedHistory(status: string, userId?: string) {
  const entry: Record<string, unknown> = { status, at: new Date() };
  if (userId) entry.by = new mongoose.Types.ObjectId(userId);
  return entry as {
    status: string;
    at: Date;
    by?: mongoose.Types.ObjectId;
  };
}

async function shipmentForRoles(
  shipmentId: string,
  rule: 'sender' | 'driver' | 'either' | 'sender_or_admin',
  userId?: string,
) {
  const shipment = await ShipmentModel.findById(shipmentId);
  if (!shipment) throw new NotFoundError();

  const user = await UserModel.findById(userId).select({ role: 1, phone: 1 }).lean();
  const isAdmin = user?.role === 'admin';

  const isSender = shipment.senderId.toString() === userId;
  const driverProfile = await DriverModel.findOne({ userId }).select({ _id: 1 }).lean();
  const isDriverAssigned =
    !!driverProfile?._id && !!shipment.driverId && shipment.driverId.equals(driverProfile._id);

  const isReceiver =
    !!user?.phone &&
    normalizePhone(String(shipment.receiver.phone)) === normalizePhone(String(user.phone));

  if (rule === 'either' && (isSender || isDriverAssigned || isAdmin || isReceiver)) return shipment;
  if (rule === 'sender_or_admin' && (isSender || isAdmin)) return shipment;
  if (rule === 'sender' && (isSender || isAdmin)) return shipment;
  if (rule === 'driver' && (isDriverAssigned || isAdmin)) return shipment;

  throw new ForbiddenError();
}

export const shipmentsQuoteController = asyncHandler(async (req: Request, res: Response) => {
  const pickup = scrubCity(req.body.pickup);
  const dropoff = scrubCity(req.body.dropoff);

  const quote = await quoteShipment({
    pickupCity: pickup.city,
    pickup: pickup.location,
    dropoff: dropoff.location,
    packageType: req.body.package.type,
    service: req.body.service,
  });

  sendOk(res, quote);
});

export const shipmentsCreateController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new ForbiddenError();
  const pickup = scrubCity(req.body.pickup);
  const dropoff = scrubCity(req.body.dropoff);

  const quote = await quoteShipment({
    pickupCity: pickup.city,
    pickup: pickup.location,
    dropoff: dropoff.location,
    packageType: req.body.package.type,
    service: req.body.service,
  });

  let trackingCode = generateTrackingCode();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const exists = await ShipmentModel.exists({ trackingCode });
    if (!exists) break;
    trackingCode = generateTrackingCode();
  }

  const pickupOtp = otpGenerator();
  const deliveryOtp = otpGenerator();
  const receiverPhone = normalizePhone(req.body.receiver.phone);

  const shipment = await ShipmentModel.create({
    trackingCode,
    senderId: new mongoose.Types.ObjectId(req.auth.userId),
    pickup,
    dropoff,
    receiver: { name: req.body.receiver.name, phone: receiverPhone },
    package: {
      ...req.body.package,
    },
    service: req.body.service,
    scheduledFor: req.body.scheduledFor,
    pricing: quote.pricing,
    payment: {
      method: req.body.paymentMethod,
      status: 'pending',
    },
    status: 'pending',
    statusHistory: [
      {
        status: 'pending',
        at: new Date(),
        by: new mongoose.Types.ObjectId(req.auth.userId),
      },
    ],
    pickupOtp,
    deliveryOtp,
    proofs: {},
    etaMinutes: quote.etaMinutes,
  });

  await notificationQueue
    ?.add('created', {
      shipmentId: shipment.id,
      trackingCode: shipment.trackingCode,
      receiverPhone: shipment.receiver?.phone as string | undefined,
    })
    .catch(() => undefined);

  void dispatchPendingShipmentToDrivers(shipment.id);

  emitShipmentStatus(shipment.id, 'pending');

  sendOk(res, await enrichShipmentDoc(shipment), 201);
});

export const shipmentsMineController = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = { senderId: new mongoose.Types.ObjectId(req.auth?.userId) };
  if (typeof req.query.status === 'string' && req.query.status.trim()) {
    filter.status = req.query.status;
  }

  const [items, total] = await Promise.all([
    ShipmentModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ShipmentModel.countDocuments(filter),
  ]);

  sendOk(res, { items: await enrichShipmentDocs(items), total });
});

/** Shipments where the authenticated user's phone matches `receiver.phone`. */
export const shipmentsIncomingController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.userId) throw new ForbiddenError();
  const me = await UserModel.findById(req.auth.userId).select({ phone: 1 }).lean();
  if (!me?.phone) throw new ForbiddenError();

  const phone = normalizePhone(String(me.phone));
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = { 'receiver.phone': phone };
  if (typeof req.query.status === 'string' && req.query.status.trim()) {
    filter.status = req.query.status;
  }

  const [items, total] = await Promise.all([
    ShipmentModel.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    ShipmentModel.countDocuments(filter),
  ]);

  sendOk(res, { items: await enrichShipmentDocs(items), total });
});

export const shipmentsGetController = asyncHandler(async (req: Request, res: Response) => {
  await shipmentForRoles(req.params.id, 'either', req.auth?.userId);
  const doc = await ShipmentModel.findById(req.params.id);
  if (!doc) throw new NotFoundError();
  sendOk(res, await enrichShipmentDoc(doc));
});

export const shipmentsCancelController = asyncHandler(async (req: Request, res: Response) => {
  const shipment = await shipmentForRoles(req.params.id, 'sender', req.auth?.userId);
  if (!['pending', 'assigned'].includes(shipment.status)) {
    throw new ConflictError('SHIPMENT_LOCKED', 'لا يمكن الإلغاء الآن', 'Cannot cancel shipment in this status.');
  }
  shipment.status = 'cancelled';
  shipment.cancelledReason = req.body.reason;
  shipment.cancelledAt = new Date();
  shipment.statusHistory.push({ status: 'cancelled', at: new Date() });
  await shipment.save();
  emitShipmentStatus(shipment.id, shipment.status);
  sendOk(res, shipment);
});

export const shipmentsRateController = asyncHandler(async (req: Request, res: Response) => {
  const shipment = await shipmentForRoles(req.params.id, 'sender_or_admin', req.auth?.userId);
  if (shipment.status !== 'delivered') {
    throw new ValidationError('غير مصرح بالتقييم حالياً', 'Rating not allowed.');
  }
  if (shipment.rating) {
    throw new ConflictError('SHIPMENT_ALREADY_RATED', 'تم التقييم مسبقاً', 'Shipment already rated.');
  }

  shipment.rating = {
    stars: req.body.stars,
    comment: req.body.comment,
    at: new Date(),
  };
  await shipment.save();

  if (shipment.driverId) {
    const driverDoc = await DriverModel.findById(shipment.driverId);
    const targetUserId = driverDoc?.userId?.toString();
    if (targetUserId) {
      const reviewed = await UserModel.findById(targetUserId);
      if (reviewed) {
        const prevAvg = reviewed.rating?.average ?? 0;
        const prevCount = reviewed.rating?.count ?? 0;
        const nextAvg =
          prevCount === 0 ? req.body.stars : (prevAvg * prevCount + req.body.stars) / (prevCount + 1);
        reviewed.rating = {
          average: Number(nextAvg.toFixed(2)),
          count: prevCount + 1,
        };
        await reviewed.save();
      }
    }
  }

  sendOk(res, shipment);
});

export const shipmentsFeedController = asyncHandler(async (req: Request, res: Response) => {
  const lat = typeof req.query.lat === 'number' ? req.query.lat : Number(req.query.lat);
  const lng = typeof req.query.lng === 'number' ? req.query.lng : Number(req.query.lng);
  const radius = typeof req.query.radius === 'number' ? req.query.radius : Number(req.query.radius);

  const pending = await ShipmentModel.find({ status: 'pending' }).limit(150).lean();
  const filtered = pending.filter((s) => {
    const pickupLoc = s.pickup.location;
    if (pickupLoc?.lat === undefined || pickupLoc?.lng === undefined) return false;
    const dist = haversineKm({ lat, lng }, { lat: pickupLoc.lat, lng: pickupLoc.lng });
    return dist <= radius;
  });
  sendOk(res, filtered);
});

export const shipmentsAcceptController = asyncHandler(async (req: Request, res: Response) => {
  const driver = await DriverModel.findOne({ userId: req.auth?.userId });
  if (!driver) throw new NotFoundError();

  const shipId = new mongoose.Types.ObjectId(req.params.id);
  const hist = pushedHistory('assigned', req.auth?.userId);
  const update = await ShipmentModel.updateOne(
    { _id: shipId, status: 'pending' },
    {
      $set: {
        status: 'assigned',
        driverId: driver._id,
      },
      $push: {
        statusHistory: hist,
      },
    },
  );

  if (update.modifiedCount === 0) {
    throw new NotFoundError('SHIPMENT_UNAVAILABLE', 'لم يعد متاحًا', 'Shipment is no longer available.');
  }

  const shipment = await ShipmentModel.findById(req.params.id);
  if (!shipment) throw new NotFoundError();

  const driverCardUser = await UserModel.findById(driver.userId).lean();

  emitShipmentStatus(shipment.id, shipment.status);
  emitShipmentEta(shipment.id, shipment.etaMinutes ?? 30);

  emitDriverAssigned(shipment.id, {
    firstName: driverCardUser?.name?.split(/\s+/)[0] ?? 'سائق',
    photoUrl: driverCardUser?.avatarUrl ?? null,
    rating: driverCardUser?.rating ?? { average: 0, count: 0 },
    vehicle: driver.vehicle,
  });

  await notificationQueue
    ?.add('assigned', {
      shipmentId: shipment.id,
      trackingCode: shipment.trackingCode,
      receiverPhone: shipment.receiver?.phone as string | undefined,
    })
    .catch(() => undefined);

  sendOk(res, shipment);
});

export const shipmentsArrivedPickupController = asyncHandler(async (req: Request, res: Response) => {
  const shipment = await shipmentForRoles(req.params.id, 'driver', req.auth?.userId);
  if (shipment.status !== 'assigned') throw new ConflictError('INVALID_STATE', 'حالة غير صالحة', 'Invalid state.');
  shipment.status = 'arrived_pickup';
  shipment.statusHistory.push(pushedHistory('arrived_pickup'));
  await shipment.save();
  emitShipmentStatus(shipment.id, shipment.status);
  sendOk(res, shipment);
});

export const shipmentsPickupController = asyncHandler(async (req: Request, res: Response) => {
  const shipment = await shipmentForRoles(req.params.id, 'driver', req.auth?.userId);
  if (shipment.status !== 'arrived_pickup') {
    throw new ConflictError('INVALID_STATE', 'حالة غير صالحة', 'Invalid pickup state.');
  }
  if (shipment.pickupOtp !== req.body.otp) {
    throw new HttpError(400, 'OTP_INVALID', 'رمز الاستلام غير صحيح', 'Invalid pickup code.');
  }
  shipment.status = 'in_transit';
  shipment.proofs.pickupPhotoUrl = req.body.photoUrl;
  shipment.statusHistory.push(pushedHistory('in_transit'));
  await shipment.save();
  emitShipmentStatus(shipment.id, shipment.status);
  sendOk(res, shipment);
});

export const shipmentsArrivedDropController = asyncHandler(async (req: Request, res: Response) => {
  const shipment = await shipmentForRoles(req.params.id, 'driver', req.auth?.userId);
  if (!['in_transit'].includes(shipment.status)) {
    throw new ConflictError('INVALID_STATE', 'حالة غير صالحة', 'Invalid state.');
  }

  shipment.status = 'arrived_dropoff';
  shipment.statusHistory.push(pushedHistory('arrived_dropoff'));
  await shipment.save();
  emitShipmentStatus(shipment.id, shipment.status);
  sendOk(res, shipment);
});

export const shipmentsDeliverController = asyncHandler(async (req: Request, res: Response) => {
  const shipment = await shipmentForRoles(req.params.id, 'driver', req.auth?.userId);
  if (shipment.status !== 'arrived_dropoff') {
    throw new ConflictError('INVALID_STATE', 'حالة غير صالحة', 'Invalid delivery state.');
  }
  if (shipment.deliveryOtp !== req.body.otp) {
    throw new HttpError(400, 'OTP_INVALID', 'رمز التسليم غير صحيح', 'Invalid delivery code.');
  }

  shipment.status = 'delivered';
  shipment.proofs.deliveryPhotoUrl = req.body.photoUrl;
  if (req.body.signatureUrl) shipment.proofs.signatureUrl = req.body.signatureUrl;
  if (shipment.payment.method === 'cash_on_delivery') {
    shipment.payment.status = 'captured';
    shipment.payment.paidAt = new Date();
  }

  shipment.statusHistory.push(pushedHistory('delivered'));
  await shipment.save();
  emitShipmentStatus(shipment.id, shipment.status);

  await notificationQueue
    ?.add('delivered', {
      shipmentId: shipment.id,
      trackingCode: shipment.trackingCode,
      receiverPhone: shipment.receiver?.phone as string | undefined,
    })
    .catch(() => undefined);

  const driverMongo = shipment.driverId ? await DriverModel.findById(shipment.driverId) : undefined;
  if (driverMongo) {
    const payout = shipment.pricing.driverPayout;
    await DriverModel.findByIdAndUpdate(driverMongo._id, {
      $inc: { 'earnings.available': payout, 'earnings.totalEarned': payout },
    }).exec();
  }

  sendOk(res, shipment);
});

export const shipmentsDisputeController = asyncHandler(async (req: Request, res: Response) => {
  const shipment = await shipmentForRoles(req.params.id, 'either', req.auth?.userId);
  if (['delivered', 'cancelled'].includes(shipment.status)) {
    throw new ConflictError('INVALID_STATE', 'لا يمكن الطعن الآن', 'Cannot dispute now.');
  }
  shipment.status = 'disputed';
  shipment.dispute = {
    reason: req.body.reason,
    photoUrls: req.body.photoUrls,
    openedAt: new Date(),
    resolved: false,
    resolution: undefined,
    refundAmount: undefined,
    resolvedAt: undefined,
  };
  shipment.statusHistory.push(pushedHistory('disputed'));
  await shipment.save();
  emitShipmentStatus(shipment.id, shipment.status);
  sendOk(res, shipment);
});
