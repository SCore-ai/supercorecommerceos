import { AuthenticationError, AuthorizationError } from '@supercore/core';
import type { CurrentUser, PermissionName, RoleName } from './types.js';

const ROLE_SET = new Set<RoleName>([
  'super_admin',
  'tenant_admin',
  'manager',
  'sales',
  'finance',
  'procurement',
  'warehouse',
  'support',
  'viewer',
]);

export function isRoleName(value: string): value is RoleName {
  return ROLE_SET.has(value as RoleName);
}

export function hasPermission(user: CurrentUser, permission: PermissionName): boolean {
  return user.permissions.includes(permission);
}

export function hasRole(user: CurrentUser, role: RoleName): boolean {
  return user.roles.includes(role);
}

export function requireUser(user: CurrentUser | null): CurrentUser {
  if (!user) {
    throw new AuthenticationError();
  }
  return user;
}

export function requirePermission(user: CurrentUser | null, permission: PermissionName): CurrentUser {
  const authenticated = requireUser(user);
  if (!hasPermission(authenticated, permission)) {
    throw new AuthorizationError(`Missing permission: ${permission}`);
  }
  return authenticated;
}
