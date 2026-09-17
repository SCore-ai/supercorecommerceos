import pino from 'pino';
import { getRequestContext } from './correlation.js';
import { getTenantContext } from './tenant.js';

const redactedPaths = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'authorization',
  'cookie',
  'secret',
  'clientSecret',
  'HMRC_CLIENT_SECRET',
  'PAYMENT_PROVIDER_API_KEY',
  'S3_SECRET_ACCESS_KEY',
  'OPENAI_API_KEY',
];

export function createLogger(service: string) {
  return pino({
    name: service,
    level: process.env.LOG_LEVEL ?? 'info',
    redact: {
      paths: redactedPaths,
      censor: '[Redacted]',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    mixin() {
      const request = getRequestContext();
      const tenant = getTenantContext();
      return {
        service,
        requestId: request?.requestId,
        correlationId: request?.correlationId,
        tenantId: tenant?.tenantId,
      };
    },
  });
}

export type Logger = ReturnType<typeof createLogger>;
