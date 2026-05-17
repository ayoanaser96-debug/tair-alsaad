import { Router } from 'express';

import * as AuthController from '../controllers/auth.controller.js';

import { authenticate } from '../middleware/authenticate.js';
import { otpPhoneRateLimiter } from '../middleware/otpRateLimit.js';
import { validate } from '../middleware/validate.js';

import { otpRequestSchema, otpVerifySchema, refreshSchema } from '../validators/schemas.js';

export function buildAuthRoutes(): Router {
  const router = Router();

  router.post(
    '/auth/otp/request',
    validate('body', otpRequestSchema),
    otpPhoneRateLimiter(),
    AuthController.requestOtpController,
  );

  router.post('/auth/otp/verify', validate('body', otpVerifySchema), AuthController.verifyOtpController);

  router.post('/auth/refresh', validate('body', refreshSchema), AuthController.refreshController);

  router.post('/auth/logout', authenticate, AuthController.logoutController);

  return router;
}
