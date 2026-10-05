import { afterAll, describe, expect, it } from 'vitest';
import {
  closeDatabase,
  getEnv,
  loadEnvFiles,
  resetEnvCache,
  runWithRequestContext,
  runWithTenantContext,
  seedReferenceData,
} from '@supercore/core';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb } from '@supercore/core';
import {
  activateUser,
  assignRoles,
  bootstrapSuperAdmin,
  inviteUser,
  permissionsForRoles,
  signIn,
  updateUserStatus,
} from '@supercore/identity';
import {
  createCustomerRecord,
  createTenantRecord,
  listCustomersRecord,
  setTenantStatusRecord,
} from '@supercore/core';

const integrationEnabled = process.env.RUN_INTEGRATION === '1';

describe.skipIf(!integrationEnabled)('Phase 1 platform core', () => {
  afterAll(async () => {
    await closeDatabase();
  });

  it('isolates tenants and writes audit with customer create', async () => {
    loadEnvFiles();
    process.env.NODE_ENV ??= 'test';
    resetEnvCache();
    getEnv();
    const here = dirname(fileURLToPath(import.meta.url));
    await migrate(getDb(), { migrationsFolder: resolve(here, '../../core/drizzle') });
    await seedReferenceData();

    const suffix = `${Date.now()}`;
    await bootstrapSuperAdmin(`super${suffix}@localhost`, 'super-admin-pass');
    const superSign = await signIn({ email: `super${suffix}@localhost`, password: 'super-admin-pass' });
    expect(superSign.user.roles).toContain('super_admin');

    const tenantA = await createTenantRecord({ name: 'A', slug: `acme${suffix}` }, { actorId: superSign.user.id });
    await setTenantStatusRecord(tenantA.id, 'active', { actorId: superSign.user.id });
    const tenantB = await createTenantRecord({ name: 'B', slug: `beta${suffix}` }, { actorId: superSign.user.id });
    await setTenantStatusRecord(tenantB.id, 'active', { actorId: superSign.user.id });

    const adminA = await runWithTenantContext({ tenantId: tenantA.id, source: 'internal' }, () =>
      inviteUser({
        email: `admin-a-${suffix}@example.com`,
        name: 'Admin A',
        roles: ['tenant_admin'],
        audit: { actorId: superSign.user.id },
      }),
    );
    await activateUser({
      email: `admin-a-${suffix}@example.com`,
      tenantSlug: tenantA.slug,
      secret: adminA.invitationSecret,
      password: 'tenant-admin-1',
    });

    const adminB = await runWithTenantContext({ tenantId: tenantB.id, source: 'internal' }, () =>
      inviteUser({
        email: `admin-b-${suffix}@example.com`,
        name: 'Admin B',
        roles: ['tenant_admin'],
        audit: { actorId: superSign.user.id },
      }),
    );
    await activateUser({
      email: `admin-b-${suffix}@example.com`,
      tenantSlug: tenantB.slug,
      secret: adminB.invitationSecret,
      password: 'tenant-admin-1',
    });

    const sessionA = await signIn({
      email: `admin-a-${suffix}@example.com`,
      password: 'tenant-admin-1',
      tenantSlug: tenantA.slug,
    });

    await runWithRequestContext({ requestId: 't1', correlationId: 't1' }, async () => {
      await runWithTenantContext({ tenantId: tenantA.id, source: 'session' }, async () => {
        await createCustomerRecord({ name: 'Cust A', email: `cust-a-${suffix}@example.com` }, { actorId: sessionA.user.id });
        const listed = await listCustomersRecord({ limit: 20, offset: 0 });
        expect(listed.items.some((row) => row.email === `cust-a-${suffix}@example.com`)).toBe(true);
      });
    });

    await runWithTenantContext({ tenantId: tenantB.id, source: 'session' }, async () => {
      const listed = await listCustomersRecord({ limit: 20, offset: 0 });
      expect(listed.items.some((row) => row.email === `cust-a-${suffix}@example.com`)).toBe(false);
    });

    expect(permissionsForRoles(['viewer']).includes('customer.write')).toBe(false);
    await expect(
      signIn({ email: `admin-a-${suffix}@example.com`, password: 'tenant-admin-1' }),
    ).rejects.toThrow();
  });

  it('refuses removing the last tenant_admin', async () => {
    loadEnvFiles();
    process.env.NODE_ENV ??= 'test';
    resetEnvCache();
    getEnv();
    const suffix = `last${Date.now()}`;
    const tenant = await createTenantRecord({ name: 'Solo', slug: `solo${suffix}` }, { actorId: null });
    await setTenantStatusRecord(tenant.id, 'active', { actorId: null });
    const invited = await runWithTenantContext({ tenantId: tenant.id, source: 'internal' }, () =>
      inviteUser({
        email: `solo-${suffix}@example.com`,
        name: 'Solo',
        roles: ['tenant_admin'],
        audit: { actorId: null },
      }),
    );
    const activated = await activateUser({
      email: `solo-${suffix}@example.com`,
      tenantSlug: tenant.slug,
      secret: invited.invitationSecret,
      password: 'tenant-admin-1',
    });
    await runWithTenantContext({ tenantId: tenant.id, source: 'session' }, async () => {
      await expect(updateUserStatus(activated.user.id, 'disabled', { actorId: activated.user.id })).rejects.toThrow();
      await expect(assignRoles(activated.user.id, ['viewer'], { actorId: activated.user.id })).rejects.toThrow();
    });
  });
});
