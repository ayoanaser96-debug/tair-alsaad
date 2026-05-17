import { randomUUID } from 'node:crypto';

import type { PreferredLanguage, Role } from '@tayralsaad/types';

import type { Logger } from 'pino';

import { env } from '../config/env.js';
import { UserModel } from '../models/User.js';
import { UnauthorizedError } from '../utils/httpError.js';
import { hashRefreshJti, signAccessToken, signRefreshToken, type RefreshTokenPayload } from '../utils/signTokens.js';
import { verifyRefreshToken } from '../utils/verifyTokens.js';

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

async function saveRefreshHashes(userId: string, hashedJti: string, familyId: string): Promise<void> {
  await UserModel.findByIdAndUpdate(userId, {
    $set: {
      'refreshSession.hashedJti': hashedJti,
      'refreshSession.familyId': familyId,
      'refreshSession.expiresAt': new Date(Date.now() + env.JWT_REFRESH_TTL_SECONDS * 1000),
    },
  }).exec();
}

type UserJwtSource = {
  id: string;
  role: string;
  preferredLanguage: string;
};

export async function issueAuthTokens(params: {
  user: UserJwtSource;
  familyId?: string;
}): Promise<AuthTokens> {
  const familyId = params.familyId ?? randomUUID();
  const refreshJti = randomUUID();

  await saveRefreshHashes(params.user.id, hashRefreshJti(refreshJti), familyId);

  const accessToken = signAccessToken({
    sub: params.user.id,
    role: params.user.role as Role,
    prefs: params.user.preferredLanguage as PreferredLanguage,
  });

  const refreshToken = signRefreshToken({
    sub: params.user.id,
    fam: familyId,
    jti: refreshJti,
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: env.JWT_ACCESS_TTL_SECONDS,
  };
}

export async function rotateRefreshToken(refreshToken: string): Promise<AuthTokens> {
  let payload: RefreshTokenPayload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError('UNAUTHORIZED', 'رمز منتهي', 'Invalid refresh token.');
  }

  const userId = payload.sub;

  const user = await UserModel.findById(userId);
  if (!user?.refreshSession?.hashedJti || user.refreshSession.familyId !== payload.fam) {
    throw new UnauthorizedError('UNAUTHORIZED', 'جلسة غير صالحة', 'Session invalidated.');
  }

  const hashedIncoming = hashRefreshJti(payload.jti);
  if (hashedIncoming !== user.refreshSession.hashedJti) {
    await UserModel.findByIdAndUpdate(userId, {
      $unset: { refreshSession: 1 },
    }).exec();
    throw new UnauthorizedError(
      'UNAUTHORIZED',
      'إعادة استخدام الرمز',
      'Refresh token reuse detected.',
    );
  }

  const newJti = randomUUID();
  await saveRefreshHashes(user.id, hashRefreshJti(newJti), payload.fam);

  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role as Role,
    prefs: user.preferredLanguage as PreferredLanguage,
  });

  const nextRefresh = signRefreshToken({
    sub: user.id,
    fam: payload.fam,
    jti: newJti,
  });

  return { accessToken, refreshToken: nextRefresh, expiresIn: env.JWT_ACCESS_TTL_SECONDS };
}

export async function revokeRefreshTokens(userId: string): Promise<void> {
  await UserModel.findByIdAndUpdate(userId, {
    $unset: { refreshSession: 1 },
  }).exec();
}

export async function signupOrUpsertVerifiedUser(params: {
  phone: string;
  name?: string;
  logger?: Logger;
}) {
  const normalizedName = params.name?.trim();

  let user = await UserModel.findOne({ phone: params.phone });
  if (!user) {
    user = await UserModel.create({
      phone: params.phone,
      name: normalizedName ?? 'مستخدم طير السعد',
      role: 'sender',
      preferredLanguage: 'ar',
      defaultAddresses: [],
    });
    return user;
  }
  if (normalizedName) user.name = normalizedName;
  await user.save();
  params.logger?.debug({ userId: user.id }, '[auth] Upsert verified user profile');
  return user;
}
