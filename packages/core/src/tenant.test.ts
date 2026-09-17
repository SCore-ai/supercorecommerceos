import { describe, expect, it } from 'vitest';
import {
  getTenantContext,
  rejectClientTenantId,
  requireTenantContext,
  runWithTenantContext,
} from './tenant.js';
import { AuthorizationError } from './errors.js';

describe('tenant context', () => {
  it('exposes tenant context inside the store', () => {
    const result = runWithTenantContext({ tenantId: 'tenant-1', source: 'session' }, () => {
      return requireTenantContext();
    });
    expect(result.tenantId).toBe('tenant-1');
    expect(getTenantContext()).toBeUndefined();
  });

  it('never accepts client-supplied tenant IDs', () => {
    expect(() => rejectClientTenantId('tenant-from-query')).toThrow(AuthorizationError);
  });
});
