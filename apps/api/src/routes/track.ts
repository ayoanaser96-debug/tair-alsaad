import { Router } from 'express';

import * as TrackController from '../controllers/track.controller.js';

export function buildTrackRoutes(): Router {
  const router = Router();

  router.get('/track/:trackingCode', TrackController.publicTrackingController);

  return router;
}
