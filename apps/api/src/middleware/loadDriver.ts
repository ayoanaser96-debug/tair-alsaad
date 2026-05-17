import type { NextFunction, Request, Response } from 'express';

import { DriverModel } from '../models/Driver.js';
import { ForbiddenError } from '../utils/httpError.js';

/** Requires driver profile document for the authenticated user. */
export async function requireDriver(req: Request, _res: Response, next: NextFunction) {
  if (!req.auth) {
    next(new ForbiddenError());
    return;
  }
  const driver = await DriverModel.findOne({ userId: req.auth.userId }).select({ _id: 1 });
  if (!driver) {
    next(new ForbiddenError('DRIVER_PROFILE_REQUIRED', 'تسجيل السائق غير موجود', 'Driver profile missing.'));
    return;
  }
  req.auth.driverProfileId = driver._id.toString();
  next();
}
