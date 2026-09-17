import type { AuthProvider, AuthRequest, Session } from './types.js';

/**
 * Default provider: unauthenticated.
 * This is a boundary, not a complete identity product.
 */
export class UnauthenticatedAuthProvider implements AuthProvider {
  async authenticate(_request: AuthRequest): Promise<Session | null> {
    return null;
  }
}

/**
 * Local development helper. Must never be constructed when NODE_ENV is production.
 */
export class DevBypassAuthProvider implements AuthProvider {
  constructor(private readonly enabled: boolean) {
    if (enabled && process.env.NODE_ENV === 'production') {
      throw new Error('Dev bypass auth is forbidden in production');
    }
  }

  async authenticate(_request: AuthRequest): Promise<Session | null> {
    if (!this.enabled) {
      return null;
    }
    return {
      user: {
        id: '00000000-0000-7000-8000-000000000001',
        tenantId: '00000000-0000-7000-8000-000000000010',
        roles: ['viewer'],
        permissions: ['system.health.read'],
      },
      tenant: {
        tenantId: '00000000-0000-7000-8000-000000000010',
        source: 'session',
      },
    };
  }
}

export function createAuthProvider(options: {
  nodeEnv: string;
  devBypass: boolean;
}): AuthProvider {
  if (options.nodeEnv === 'production' || !options.devBypass) {
    return new UnauthenticatedAuthProvider();
  }
  return new DevBypassAuthProvider(true);
}
