import { readCookie, SESSION_COOKIE_NAME } from '@supercore/core';
import type { AuthProvider, AuthRequest, Session } from './types.js';
import { loadSession } from './users.js';

export class UnauthenticatedAuthProvider implements AuthProvider {
  async authenticate(_request: AuthRequest): Promise<Session | null> {
    return null;
  }
}

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
        email: 'dev@localhost',
        name: 'Dev Bypass',
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

export class SessionAuthProvider implements AuthProvider {
  async authenticate(request: AuthRequest): Promise<Session | null> {
    const sessionId = readCookie(request.headers.get('cookie'), SESSION_COOKIE_NAME);
    if (!sessionId) {
      return null;
    }
    return loadSession(sessionId);
  }
}

export function createAuthProvider(options: {
  nodeEnv: string;
  devBypass: boolean;
}): AuthProvider {
  if (options.devBypass && options.nodeEnv !== 'production') {
    return new DevBypassAuthProvider(true);
  }
  return new SessionAuthProvider();
}
