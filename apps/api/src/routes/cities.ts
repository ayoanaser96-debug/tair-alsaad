import { Router } from 'express';

import { publicCitiesListController } from '../controllers/cities.controller.js';

export function buildPublicCitiesRoutes(): Router {
  const router = Router();
  router.get('/cities', publicCitiesListController);
  return router;
}
