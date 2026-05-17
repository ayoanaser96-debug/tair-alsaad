import { Router } from 'express';

import * as AdminController from '../controllers/admin.controller.js';

import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';

import {
  adminCityPatchSchema,
  adminDisputesQuerySchema,
  adminDriverStatusSchema,
  adminDriversQuerySchema,
  adminPayoutProcessSchema,
  adminShipmentsQuerySchema,
  disputeResolveSchema,
  paginationQuerySchema,
} from '../validators/schemas.js';

export function buildAdminRoutes(): Router {
  const router = Router();

  router.get('/admin/overview', authenticate, requireRole('admin'), AdminController.adminOverviewController);

  router.get(
    '/admin/users',
    authenticate,
    requireRole('admin'),
    validate('query', paginationQuerySchema),
    AdminController.adminUsersListController,
  );

  router.get(
    '/admin/drivers',
    authenticate,
    requireRole('admin'),
    validate('query', adminDriversQuerySchema),
    AdminController.adminDriversListController,
  );

  router.patch(
    '/admin/drivers/:id/status',
    authenticate,
    requireRole('admin'),
    validate('body', adminDriverStatusSchema),
    AdminController.adminDriverStatusController,
  );

  router.get(
    '/admin/shipments',
    authenticate,
    requireRole('admin'),
    validate('query', adminShipmentsQuerySchema),
    AdminController.adminShipmentsController,
  );

  router.get('/admin/cities', authenticate, requireRole('admin'), AdminController.adminCitiesController);

  router.patch(
    '/admin/cities/:id',
    authenticate,
    requireRole('admin'),
    validate('body', adminCityPatchSchema),
    AdminController.adminCityPatchController,
  );

  router.get(
    '/admin/disputes',
    authenticate,
    requireRole('admin'),
    validate('query', adminDisputesQuerySchema),
    AdminController.adminDisputesListController,
  );

  router.post(
    '/admin/disputes/:id/resolve',
    authenticate,
    requireRole('admin'),
    validate('body', disputeResolveSchema),
    AdminController.adminDisputeResolveController,
  );

  router.get(
    '/admin/payouts',
    authenticate,
    requireRole('admin'),
    validate('query', paginationQuerySchema),
    AdminController.adminPayoutListController,
  );

  router.post(
    '/admin/payouts/:id/process',
    authenticate,
    requireRole('admin'),
    validate('body', adminPayoutProcessSchema),
    AdminController.adminPayoutProcessController,
  );

  return router;
}
