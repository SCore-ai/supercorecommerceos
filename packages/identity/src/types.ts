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

export type PermissionName = string;

export type CurrentUser = {
  id: string;
  tenantId: string;
  organizationId?: string;
  roles: RoleName[];
  permissions: PermissionName[];
};

export type Session = {
  user: CurrentUser;
  tenant: TenantContext;
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
