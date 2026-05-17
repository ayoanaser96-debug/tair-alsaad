import { config as loadEnvFile } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Monorepo root: `apps/api/src/config` → four parents up */
const repoRoot = path.resolve(__dirname, '..', '..', '..', '..');

loadEnvFile({ path: path.join(repoRoot, '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().default('/api/v1'),
  MONGODB_URI: z.string().min(1),
  REDIS_URL: z.string().min(1).optional(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  JWT_REFRESH_TTL_SECONDS: z.coerce.number().int().positive().default(60 * 60 * 24 * 30),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  WEB_PUBLIC_URL: z.string().url().default('http://localhost:5173'),
  /** Meta WhatsApp Cloud API (optional; worker skips sends if unset). */
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_CLOUD_API_VERSION: z.string().default('v21.0'),
  /** Webhook verification (GET). */
  WHATSAPP_VERIFY_TOKEN: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  /** Base URL for absolute links (e.g. uploaded files). Defaults to http://localhost:${PORT}. */
  PUBLIC_API_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
