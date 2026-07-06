import { Router } from 'express';

import * as AuthController from '../controllers/auth.controller.js';

import { authenticate } from '../middleware/authenticate.js';
import { otpPhoneRateLimiter } from '../middleware/otpRateLimit.js';
import { otpRequestIpRateLimiter, otpVerifyRateLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';

import { adminLoginSchema, otpRequestSchema, otpVerifySchema, refreshSchema } from '../validators/schemas.js';

export function buildAuthRoutes(): Router {
  const router = Router();

  router.post(
    '/auth/otp/request',
    otpRequestIpRateLimiter,
    validate('body', otpRequestSchema),
    otpPhoneRateLimiter(),
    AuthController.requestOtpController,
  );

  router.post(
    '/auth/otp/verify',
    otpVerifyRateLimiter,
    validate('body', otpVerifySchema),
    AuthController.verifyOtpController,
  );

  router.post(
    '/auth/admin/login',
    otpVerifyRateLimiter,
    validate('body', adminLoginSchema),
    AuthController.adminLoginController,
  );

  router.post('/auth/refresh', validate('body', refreshSchema), AuthController.refreshController);

  router.post('/auth/logout', authenticate, AuthController.logoutController);

  return router;
}
