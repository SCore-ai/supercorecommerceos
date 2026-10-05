import { AuthenticationError, AuthorizationError } from '@supercore/core';
import { ROLE_NAMES, type CurrentUser, type PermissionName, type RoleName } from './types.js';

const ROLE_SET = new Set<RoleName>(ROLE_NAMES);

export function isRoleName(value: string): value is RoleName {
  return ROLE_SET.has(value as RoleName);
}

export function hasPermission(user: CurrentUser, permission: PermissionName): boolean {
  return user.permissions.includes(permission);
}

export function hasRole(user: CurrentUser, role: RoleName): boolean {
  return user.roles.includes(role);
}

export function requireUser(user: CurrentUser | null | undefined): CurrentUser {
  if (!user) {
    throw new AuthenticationError();
  }
  return user;
}

export function requirePermission(user: CurrentUser | null | undefined, permission: PermissionName): CurrentUser {
  const authenticated = requireUser(user);
  if (!hasPermission(authenticated, permission)) {
    throw new AuthorizationError(`Missing permission: ${permission}`);
  }
  return authenticated;
}

export function requireRole(user: CurrentUser | null | undefined, role: RoleName): CurrentUser {
  const authenticated = requireUser(user);
  if (!hasRole(authenticated, role)) {
    throw new AuthorizationError(`Missing role: ${role}`);
  }
  return authenticated;
}

export function requireSuperAdmin(user: CurrentUser | null | undefined): CurrentUser {
  return requireRole(user, 'super_admin');
}

export type AddressOwnerType = 'customer' | 'supplier' | 'organization';

export function assertAddressWrite(user: CurrentUser, ownerType: AddressOwnerType): void {
  requirePermission(user, 'address.write');
  if (ownerType === 'customer') {
    requirePermission(user, 'customer.write');
    return;
  }
  if (ownerType === 'supplier') {
    requirePermission(user, 'supplier.write');
    return;
  }
  requirePermission(user, 'organization.write');
}
