import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { deleteCookie, setCookie } from 'hono/cookie';
import { secureHeaders } from 'hono/secure-headers';
import { timeout } from 'hono/timeout';
import {
  AppError,
  AuthorizationError,
  MemoryRateLimiter,
  SESSION_COOKIE_NAME,
  ValidationError,
  getEnv,
  isAllowedOrigin,
  originAllowList,
  pingDatabase,
  pingRedis,
  rejectClientTenantId,
  requiresOriginCheck,
  resolveCorrelationIds,
  resolveRequestOrigin,
  runWithRequestContext,
  runWithTenantContext,
  sessionCookieOptions,
} from '@supercore/core';
import {
  activateUser,
  changePassword,
  createAuthProvider,
  requireUser,
  signIn,
  type CurrentUser,
  type Session,
} from '@supercore/identity';
import { executeGraphql, type GraphqlContext } from './graphql.js';

type AuthVariables = {
  requestId: string;
  correlationId: string;
  user: CurrentUser | null;
  session: Session | null;
};

function auditFromRequest(c: { req: { header: (name: string) => string | undefined } }) {
  return {
    actorId: null as string | null,
    ip: c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local',
    userAgent: c.req.header('user-agent'),
  };
}

export function createApp() {
  const app = new Hono<{ Variables: AuthVariables }>();
  const env = getEnv();
  const rateLimiter = new MemoryRateLimiter(120, 60_000);
  const authProvider = createAuthProvider({
    nodeEnv: env.NODE_ENV,
    devBypass: env.AUTH_DEV_BYPASS,
  });
  const allowedOrigins = originAllowList(env);
  const cookieOptions = sessionCookieOptions(env.NODE_ENV);

  app.use('*', secureHeaders());
  app.use(
    '*',
    cors({
      origin: allowedOrigins,
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Correlation-Id'],
      credentials: true,
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

    const clientTenant = c.req.query('tenantId') ?? c.req.header('x-tenant-id');
    if (clientTenant) {
      rejectClientTenantId(clientTenant);
    }

    return runWithRequestContext(ids, async () => {
      const session = await authProvider.authenticate({ headers: c.req.raw.headers });
      c.set('session', session);
      c.set('user', session?.user ?? null);

      if (session && requiresOriginCheck(c.req.method)) {
        const origin = resolveRequestOrigin(c.req.raw.headers);
        if (!isAllowedOrigin(origin, allowedOrigins)) {
          throw new AuthorizationError('Origin is not allowed');
        }
      }

      if (session?.tenant) {
        return runWithTenantContext(session.tenant, () => next());
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

  app.post('/auth/sign-in', async (c) => {
    const body = await c.req.json<{ email?: string; password?: string; tenantSlug?: string | null }>();
    if (!body.email || !body.password) {
      throw new ValidationError('email and password are required');
    }
    const result = await signIn({
      email: body.email,
      password: body.password,
      tenantSlug: body.tenantSlug,
    });
    setCookie(c, SESSION_COOKIE_NAME, result.sessionId, cookieOptions);
    return c.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        tenantId: result.user.tenantId,
        roles: result.user.roles,
        permissions: result.user.permissions,
      },
      tenantName: result.tenantName,
    });
  });

  app.post('/auth/activate', async (c) => {
    const body = await c.req.json<{
      email?: string;
      tenantSlug?: string;
      secret?: string;
      password?: string;
    }>();
    if (!body.email || !body.tenantSlug || !body.secret || !body.password) {
      throw new ValidationError('email, tenantSlug, secret, and password are required');
    }
    const result = await activateUser({
      email: body.email,
      tenantSlug: body.tenantSlug,
      secret: body.secret,
      password: body.password,
    });
    setCookie(c, SESSION_COOKIE_NAME, result.sessionId, cookieOptions);
    return c.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        tenantId: result.user.tenantId,
        roles: result.user.roles,
      },
    });
  });

  app.post('/auth/sign-out', (c) => {
    deleteCookie(c, SESSION_COOKIE_NAME, { path: '/' });
    return c.json({ ok: true });
  });

  app.get('/auth/me', (c) => {
    const user = requireUser(c.get('user'));
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenantId: user.tenantId,
        roles: user.roles,
        permissions: user.permissions,
      },
    });
  });

  app.post('/auth/change-password', async (c) => {
    const user = requireUser(c.get('user'));
    const body = await c.req.json<{ currentPassword?: string; nextPassword?: string }>();
    if (!body.currentPassword || !body.nextPassword) {
      throw new ValidationError('currentPassword and nextPassword are required');
    }
    const result = await changePassword(user, body.currentPassword, body.nextPassword);
    setCookie(c, SESSION_COOKIE_NAME, result.sessionId, cookieOptions);
    return c.json({ ok: true });
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
      throw new ValidationError('GraphQL query is required');
    }
    const audit = auditFromRequest(c);
    const context: GraphqlContext = {
      user: c.get('user'),
      session: c.get('session'),
      correlationId: c.get('correlationId'),
      audit,
    };
    const result = await executeGraphql(
      {
        query: body.query,
        variables: body.variables,
        operationName: body.operationName,
      },
      context,
    );
    return c.json(result);
  });

  return app;
}
