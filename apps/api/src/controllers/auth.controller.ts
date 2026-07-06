import { normalizePhone } from '@tayralsaad/utils';
import type { Request, Response } from 'express';

import { env } from '../config/env.js';
import { adminEmailPasswordLogin, revokeRefreshTokens, issueAuthTokens, rotateRefreshToken, signupOrUpsertVerifiedUser } from '../services/authService.js';
import { consumeOtp, requestOtp } from '../services/otpService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk } from '../utils/apiResponse.js';
import { HttpError } from '../utils/httpError.js';

export const requestOtpController = asyncHandler(async (req: Request, res: Response) => {
  const normalized = normalizePhone(req.body.phone);
  const otp = requestOtp(normalized, req.logger);
  req.logger.debug({ phone: normalized }, '[auth] OTP requested');
  sendOk(res, {
    expiresIn: otp.expiresIn,
    ...(env.NODE_ENV === 'production' ? {} : { devCode: otp.devCode }),
  });
});

export const verifyOtpController = asyncHandler(async (req: Request, res: Response) => {
  const normalized = normalizePhone(req.body.phone);
  const okConsumed = consumeOtp(normalized, req.body.code);
  if (!okConsumed) {
    throw new HttpError(
      400,
      'OTP_INVALID',
      'رمز التحقق غير صحيح',
      'Invalid verification code',
    );
  }

  const user = await signupOrUpsertVerifiedUser({
    phone: normalized,
    name: req.body.name,
    role: req.body.role,
    logger: req.logger,
  });

  const tokens = await issueAuthTokens({
    user: {
      id: user.id ?? user._id.toString(),
      role: user.role,
      preferredLanguage: user.preferredLanguage,
    },
  });
  sendOk(res, {
    user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: tokens.expiresIn,
  });
});

export const adminLoginController = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminEmailPasswordLogin({
    email: req.body.email,
    password: req.body.password,
  });
  const tokens = await issueAuthTokens({
    user: {
      id: user.id ?? user._id.toString(),
      role: user.role,
      preferredLanguage: user.preferredLanguage,
    },
  });
  sendOk(res, {
    user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: tokens.expiresIn,
  });
});

export const refreshController = asyncHandler(async (req: Request, res: Response) => {
  const rotated = await rotateRefreshToken(req.body.refreshToken);
  sendOk(res, {
    accessToken: rotated.accessToken,
    refreshToken: rotated.refreshToken,
    expiresIn: rotated.expiresIn,
  });
});

export const logoutController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) return res.sendStatus(204);
  await revokeRefreshTokens(req.auth.userId);
  return res.sendStatus(204);
});
