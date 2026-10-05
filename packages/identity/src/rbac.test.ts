import { describe, expect, it } from 'vitest';
import { AuthorizationError } from '@supercore/core';
import { assertAddressWrite, hasPermission } from './rbac.js';
import { permissionsForRoles, type CurrentUser } from './types.js';

function user(roles: CurrentUser['roles']): CurrentUser {
  return {
    id: '1',
    tenantId: 't1',
    email: 'a@example.com',
    name: 'A',
    roles,
    permissions: permissionsForRoles(roles),
  };
}

describe('Phase 1 RBAC', () => {
  it('does not give sales supplier.write', () => {
    expect(hasPermission(user(['sales']), 'supplier.write')).toBe(false);
    expect(hasPermission(user(['sales']), 'customer.write')).toBe(true);
  });

  it('blocks sales from writing supplier addresses', () => {
    expect(() => assertAddressWrite(user(['sales']), 'supplier')).toThrow(AuthorizationError);
    expect(() => assertAddressWrite(user(['sales']), 'customer')).not.toThrow();
  });

  it('allows procurement supplier addresses only', () => {
    expect(() => assertAddressWrite(user(['procurement']), 'supplier')).not.toThrow();
    expect(() => assertAddressWrite(user(['procurement']), 'customer')).toThrow(AuthorizationError);
  });

  it('does not give viewer audit.read', () => {
    expect(hasPermission(user(['viewer']), 'audit.read')).toBe(false);
  });
});
