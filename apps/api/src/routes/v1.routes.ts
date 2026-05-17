import { Router } from 'express';

import { buildAdminRoutes } from './admin.js';
import { buildAuthRoutes } from './auth.js';
import { buildPublicCitiesRoutes } from './cities.js';
import { buildDriverRoutes } from './driver.js';
import { buildMeRoutes } from './me.js';
import { buildShipmentsRoutes } from './shipments.js';
import { buildTrackRoutes } from './track.js';
import { buildUploadRoutes } from './uploads.js';

/** Composes modular route groups (Prompt 3 layout). */
export function buildApiRouter(): Router {
  const router = Router();

  router.use(buildAuthRoutes());
  router.use(buildPublicCitiesRoutes());
  router.use(buildMeRoutes());
  router.use('/uploads', buildUploadRoutes());
  router.use(buildDriverRoutes());
  router.use(buildShipmentsRoutes());
  router.use(buildTrackRoutes());
  router.use(buildAdminRoutes());

  return router;
}
