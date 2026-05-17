import type { ApiErrorPayload, ApiResponse, ApiSuccess } from '@tayralsaad/types';
import type { Response } from 'express';

export function ok<T>(data: T): ApiSuccess<T> {
  return { ok: true as const, data };
}

export function fail(payload: Omit<ApiErrorPayload, never>): ApiResponse<never> {
  return { ok: false as const, error: payload };
}

export function sendOk<T>(res: Response, data: T, status = 200) {
  res.status(status).json(ok(data));
}

export function sendFail(res: Response, status: number, error: ApiErrorPayload) {
  res.status(status).json(fail(error));
}
