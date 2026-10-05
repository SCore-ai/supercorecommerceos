import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  API_PORT: z.coerce.number().int().positive().default(4000),
  API_URL: z.string().url(),
  WEB_URL: z.string().url(),
  ADMIN_URL: z.string().url(),
  CORS_ORIGINS: z.string().optional(),
  AUTH_DEV_BYPASS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  BOOTSTRAP_SUPERADMIN_EMAIL: z.union([z.string().email(), z.literal('')]).optional(),
  BOOTSTRAP_SUPERADMIN_PASSWORD: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  HMRC_CLIENT_ID: z.string().optional(),
  HMRC_CLIENT_SECRET: z.string().optional(),
  PAYMENT_PROVIDER_API_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | undefined;

export function loadEnvFiles(): void {
  const candidates = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../../.env'),
    resolve(process.cwd(), '../../../.env'),
  ];

  for (const path of candidates) {
    if (existsSync(path)) {
      loadDotenv({ path, override: false });
    }
  }
}

export function parseEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  return envSchema.parse(source);
}

export function getEnv(): AppEnv {
  if (!cached) {
    cached = parseEnv();
  }
  return cached;
}

export function resetEnvCache(): void {
  cached = undefined;
}

export { envSchema };
