import { env } from '../config/env.js';

import type { Logger } from 'pino';

import { otpGenerator } from '../utils/otpGenerator.js';

type PendingOtp = { code: string; expiresAt: number };
type OtpIssueResult = { expiresIn: number; devCode?: string };

const pending = new Map<string, PendingOtp>();

export function requestOtp(phone: string, logger?: Logger): OtpIssueResult {
  const code = otpGenerator();
  const ttlMs = env.NODE_ENV === 'production' ? 60_000 : 5 * 60_000;
  pending.set(phone, { code, expiresAt: Date.now() + ttlMs });

  if (env.NODE_ENV === 'production') {
    logger?.info({ phone }, '[otp] code issued');
  } else if (logger) {
    logger.info({ phone, code }, '[otp][dev] stub');
  }

  const expiresIn = Math.floor(ttlMs / 1000);
  if (env.NODE_ENV !== 'production') {
    return { expiresIn, devCode: code };
  }
  return { expiresIn };
}

export function consumeOtp(phone: string, code: string): boolean {
  const entry = pending.get(phone);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    pending.delete(phone);
    return false;
  }
  if (entry.code !== code) return false;
  pending.delete(phone);
  return true;
}
