import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { timeout } from 'hono/timeout';
import {
  AppError,
  MemoryRateLimiter,
  getEnv,
  pingDatabase,
  pingRedis,
  resolveCorrelationIds,
  runWithRequestContext,
  runWithTenantContext,
} from '@supercore/core';
import { createAuthProvider } from '@supercore/identity';
import { executeGraphql } from './graphql.js';

type AuthVariables = {
  requestId: string;
  correlationId: string;
};

export function createApp() {
  const app = new Hono<{ Variables: AuthVariables }>();
  const env = getEnv();
  const rateLimiter = new MemoryRateLimiter(120, 60_000);
  const authProvider = createAuthProvider({
    nodeEnv: env.NODE_ENV,
    devBypass: env.AUTH_DEV_BYPASS,
  });

  const allowedOrigins = (env.CORS_ORIGINS ?? `${env.WEB_URL},${env.ADMIN_URL}`)
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  app.use('*', secureHeaders());
  app.use(
    '*',
    cors({
      origin: allowedOrigins,
      allowMethods: ['GET', 'POST', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Correlation-Id'],
      maxAge: 600,
    }),
  );
  app.use('*', timeout(30_000));

  app.use('*', async (c, next) => {
    const ids = resolveCorrelationIds(c.req.raw.headers);
    c.set('requestId', ids.requestId);
    c.set('correlationId', ids.correlationId);
    c.header('x-request-id', ids.requestId);
    c.header('x-correlation-id', ids.correlationId);

    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
    const limit = await rateLimiter.consume(ip);
    if (!limit.allowed) {
      return c.json(
        {
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests',
            correlationId: ids.correlationId,
          },
        },
        429,
      );
    }

    return runWithRequestContext(ids, async () => {
      const session = await authProvider.authenticate({ headers: c.req.raw.headers });
      if (session) {
        return runWithTenantContext(session.tenant, () => next());
      }
      const clientTenant = c.req.query('tenantId') ?? c.req.header('x-tenant-id');
      if (clientTenant) {
        return c.json(
          {
            error: {
              code: 'AUTHORIZATION_ERROR',
              message: 'tenantId cannot be supplied by the client',
              correlationId: ids.correlationId,
            },
          },
          403,
        );
      }
      return next();
    });
  });

  app.onError((error, c) => {
    const correlationId = c.get('correlationId');
    if (error instanceof AppError) {
      return c.json(error.toPublicJSON(correlationId), error.status as never);
    }
    return c.json(
      {
        error: {
          code: 'INFRASTRUCTURE_ERROR',
          message: env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message,
          correlationId,
        },
      },
      500,
    );
  });

  app.get('/health', (c) => {
    return c.json({
      status: 'ok',
      service: 'api',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/live', (c) => {
    return c.json({
      status: 'alive',
      service: 'api',
    });
  });

  app.get('/ready', async (c) => {
    const checks: Record<string, 'ok' | 'error'> = {
      postgres: 'ok',
      redis: 'ok',
    };

    try {
      await pingDatabase();
    } catch {
      checks.postgres = 'error';
    }

    try {
      await pingRedis();
    } catch {
      checks.redis = 'error';
    }

    const ready = checks.postgres === 'ok' && checks.redis === 'ok';
    return c.json(
      {
        status: ready ? 'ready' : 'not_ready',
        service: 'api',
        checks,
      },
      ready ? 200 : 503,
    );
  });

  app.get('/graphql', (c) => {
    return c.json({
      status: 'ok',
      service: 'graphql',
      message: 'POST a GraphQL query to this endpoint.',
    });
  });

  app.post('/graphql', async (c) => {
    const body = await c.req.json<{
      query?: string;
      variables?: Record<string, unknown>;
      operationName?: string;
    }>();
    if (!body.query || typeof body.query !== 'string') {
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'GraphQL query is required',
            correlationId: c.get('correlationId'),
          },
        },
        400,
      );
    }
    const result = await executeGraphql({
      query: body.query,
      variables: body.variables,
      operationName: body.operationName,
    });
    return c.json(result);
  });

  return app;
}
