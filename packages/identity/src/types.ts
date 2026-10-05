import type { TenantContext } from '@supercore/core';

export const ROLE_NAMES = [
  'super_admin',
  'tenant_admin',
  'manager',
  'sales',
  'finance',
  'procurement',
  'warehouse',
  'support',
  'viewer',
] as const;

export type RoleName = (typeof ROLE_NAMES)[number];

export const PERMISSION_NAMES = [
  'tenant.read',
  'tenant.update',
  'organization.read',
  'organization.write',
  'user.read',
  'user.write',
  'role.assign',
  'customer.read',
  'customer.write',
  'supplier.read',
  'supplier.write',
  'address.write',
  'audit.read',
] as const;

export type PermissionName = (typeof PERMISSION_NAMES)[number] | string;

const ALL_TENANT_PERMISSIONS: PermissionName[] = [...PERMISSION_NAMES];

export const ROLE_PERMISSIONS: Record<RoleName, PermissionName[]> = {
  super_admin: [],
  tenant_admin: ALL_TENANT_PERMISSIONS,
  manager: [
    'tenant.read',
    'organization.read',
    'user.read',
    'customer.read',
    'customer.write',
    'supplier.read',
    'supplier.write',
    'address.write',
    'audit.read',
  ],
  sales: ['customer.read', 'customer.write', 'address.write', 'organization.read'],
  finance: ['customer.read', 'supplier.read', 'audit.read'],
  procurement: ['supplier.read', 'supplier.write', 'address.write'],
  warehouse: ['customer.read', 'supplier.read'],
  support: ['user.read', 'customer.read', 'supplier.read'],
  viewer: ['tenant.read', 'organization.read', 'user.read', 'customer.read', 'supplier.read'],
};

export function permissionsForRoles(roles: RoleName[]): PermissionName[] {
  const set = new Set<PermissionName>();
  for (const role of roles) {
    for (const permission of ROLE_PERMISSIONS[role]) {
      set.add(permission);
    }
  }
  return [...set];
}

export type CurrentUser = {
  id: string;
  tenantId: string | null;
  organizationId?: string;
  email: string;
  name: string;
  roles: RoleName[];
  permissions: PermissionName[];
};

export type Session = {
  user: CurrentUser;
  tenant: TenantContext | null;
};

export type AuthRequest = {
  headers: Headers;
};

export interface AuthProvider {
  authenticate(request: AuthRequest): Promise<Session | null>;
}

export type IdentityContext = {
  user: CurrentUser | null;
  tenant: TenantContext | null;
};
