import { BusinessRuleError } from './errors.js';

export const TENANT_STATUSES = ['provisioning', 'active', 'suspended'] as const;
export type TenantStatus = (typeof TENANT_STATUSES)[number];

export const USER_STATUSES = ['invited', 'active', 'disabled'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const ARCHIVE_STATUSES = ['active', 'archived'] as const;
export type ArchiveStatus = (typeof ARCHIVE_STATUSES)[number];

const TENANT_TRANSITIONS: Record<TenantStatus, readonly TenantStatus[]> = {
  provisioning: ['active'],
  active: ['suspended'],
  suspended: ['active'],
};

export function isTenantStatus(value: string): value is TenantStatus {
  return (TENANT_STATUSES as readonly string[]).includes(value);
}

export function isUserStatus(value: string): value is UserStatus {
  return (USER_STATUSES as readonly string[]).includes(value);
}

export function assertTenantStatusTransition(from: TenantStatus, to: TenantStatus): void {
  if (from === to) {
    throw new BusinessRuleError(`Tenant is already ${to}`);
  }
  if (!TENANT_TRANSITIONS[from].includes(to)) {
    throw new BusinessRuleError(`Tenant cannot move from ${from} to ${to}`);
  }
}

export function tenantAllowsSignIn(status: TenantStatus): boolean {
  return status === 'active';
}

export function tenantAllowsJobs(status: TenantStatus): boolean {
  return status === 'active';
}

export function userAllowsSignIn(status: UserStatus): boolean {
  return status === 'active';
}
