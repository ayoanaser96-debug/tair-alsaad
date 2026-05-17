import { Router } from 'express';

import * as ShipmentsController from '../controllers/shipments.controller.js';

import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';

import {
  cancelShipmentSchema,
  createShipmentSchema,
  feedQuerySchema,
  quoteShipmentBodySchema,
  rateShipmentSchema,
  shipmentDeliverSchema,
  shipmentDisputeSchema,
  shipmentPickupVerifySchema,
  shipmentsMineQuerySchema,
} from '../validators/schemas.js';

export function buildShipmentsRoutes(): Router {
  const router = Router();

  router.post(
    '/shipments/quote',
    authenticate,
    requireRole('sender'),
    validate('body', quoteShipmentBodySchema),
    ShipmentsController.shipmentsQuoteController,
  );

  router.post(
    '/shipments',
    authenticate,
    requireRole('sender'),
    validate('body', createShipmentSchema),
    ShipmentsController.shipmentsCreateController,
  );

  router.get(
    '/shipments/mine',
    authenticate,
    requireRole('sender'),
    validate('query', shipmentsMineQuerySchema),
    ShipmentsController.shipmentsMineController,
  );

  router.get(
    '/shipments/incoming',
    authenticate,
    validate('query', shipmentsMineQuerySchema),
    ShipmentsController.shipmentsIncomingController,
  );

  router.get(
    '/shipments/feed',
    authenticate,
    requireRole('driver'),
    validate('query', feedQuerySchema),
    ShipmentsController.shipmentsFeedController,
  );

  router.post(
    '/shipments/:id/accept',
    authenticate,
    requireRole('driver'),
    ShipmentsController.shipmentsAcceptController,
  );

  router.post(
    '/shipments/:id/arrived-pickup',
    authenticate,
    requireRole('driver'),
    ShipmentsController.shipmentsArrivedPickupController,
  );

  router.post(
    '/shipments/:id/pickup',
    authenticate,
    requireRole('driver'),
    validate('body', shipmentPickupVerifySchema),
    ShipmentsController.shipmentsPickupController,
  );

  router.post(
    '/shipments/:id/arrived-dropoff',
    authenticate,
    requireRole('driver'),
    ShipmentsController.shipmentsArrivedDropController,
  );

  router.post(
    '/shipments/:id/deliver',
    authenticate,
    requireRole('driver'),
    validate('body', shipmentDeliverSchema),
    ShipmentsController.shipmentsDeliverController,
  );

  router.post(
    '/shipments/:id/dispute',
    authenticate,
    validate('body', shipmentDisputeSchema),
    ShipmentsController.shipmentsDisputeController,
  );

  router.post(
    '/shipments/:id/cancel',
    authenticate,
    requireRole('sender'),
    validate('body', cancelShipmentSchema),
    ShipmentsController.shipmentsCancelController,
  );

  router.post(
    '/shipments/:id/rate',
    authenticate,
    requireRole('sender'),
    validate('body', rateShipmentSchema),
    ShipmentsController.shipmentsRateController,
  );

  router.get('/shipments/:id', authenticate, ShipmentsController.shipmentsGetController);

  return router;
}
