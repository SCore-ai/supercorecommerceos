import { describe, expect, it } from 'vitest';
import { assertTenantStatusTransition, tenantAllowsJobs, tenantAllowsSignIn } from './lifecycle.js';
import { BusinessRuleError } from './errors.js';

describe('tenant lifecycle', () => {
  it('allows provisioning to active and active to suspended', () => {
    expect(() => assertTenantStatusTransition('provisioning', 'active')).not.toThrow();
    expect(() => assertTenantStatusTransition('active', 'suspended')).not.toThrow();
    expect(() => assertTenantStatusTransition('suspended', 'active')).not.toThrow();
  });

  it('forbids returning to provisioning', () => {
    expect(() => assertTenantStatusTransition('active', 'provisioning')).toThrow(BusinessRuleError);
  });

  it('only active tenants allow sign-in and jobs', () => {
    expect(tenantAllowsSignIn('active')).toBe(true);
    expect(tenantAllowsSignIn('suspended')).toBe(false);
    expect(tenantAllowsJobs('provisioning')).toBe(false);
  });
});
