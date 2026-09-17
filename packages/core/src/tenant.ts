import { AsyncLocalStorage } from 'node:async_hooks';
import { AuthorizationError } from './errors.js';

export type TenantContextSource = 'session' | 'internal';

export type TenantContext = {
  tenantId: string;
  organizationId?: string;
  source: TenantContextSource;
};

const storage = new AsyncLocalStorage<TenantContext>();

export function runWithTenantContext<T>(context: TenantContext, fn: () => T): T {
  if (!context.tenantId || context.tenantId.trim() === '') {
    throw new AuthorizationError('Tenant context requires a tenantId');
  }
  if (context.source !== 'session' && context.source !== 'internal') {
    throw new AuthorizationError('Invalid tenant context source');
  }
  return storage.run(context, fn);
}

export function getTenantContext(): TenantContext | undefined {
  return storage.getStore();
}

export function requireTenantContext(): TenantContext {
  const context = getTenantContext();
  if (!context) {
    throw new AuthorizationError('Tenant context is required');
  }
  return context;
}

/**
 * Client-supplied tenant IDs are never trusted.
 * Tenant identity must come from authenticated session context or an internal job.
 */
export function rejectClientTenantId(_candidate: unknown): never {
  throw new AuthorizationError('tenantId cannot be supplied by the client');
}
