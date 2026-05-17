import { Router } from 'express';

import * as DriverController from '../controllers/driver.controller.js';

import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';

import { driverApplySchema, driverLocationSchema, driverOnlineSchema } from '../validators/schemas.js';

export function buildDriverRoutes(): Router {
  const router = Router();

  router.post('/driver/apply', authenticate, validate('body', driverApplySchema), DriverController.applyDriver);

  router.get('/driver/me', authenticate, requireRole('driver'), DriverController.getDriverProfile);

  router.get(
    '/driver/active-shipment',
    authenticate,
    requireRole('driver'),
    DriverController.getActiveShipment,
  );

  router.patch(
    '/driver/online',
    authenticate,
    requireRole('driver'),
    validate('body', driverOnlineSchema),
    DriverController.toggleOnline,
  );

  router.post(
    '/driver/location',
    authenticate,
    requireRole('driver'),
    validate('body', driverLocationSchema),
    DriverController.postDriverLocation,
  );

  router.get('/driver/earnings', authenticate, requireRole('driver'), DriverController.getDriverEarnings);

  router.post(
    '/driver/payout/request',
    authenticate,
    requireRole('driver'),
    DriverController.requestPayoutBatch,
  );

  return router;
}
