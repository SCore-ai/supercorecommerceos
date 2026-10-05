import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

const timestamptz = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' });

export const systemMeta = pgTable('system_meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamptz('updated_at').notNull(),
});

export const tenants = pgTable(
  'tenants',
  {
    id: text('id').primaryKey(),
    businessId: text('business_id'),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    status: text('status').notNull(),
    createdAt: timestamptz('created_at').notNull(),
    updatedAt: timestamptz('updated_at').notNull(),
  },
  (table) => [uniqueIndex('tenants_slug_uidx').on(table.slug)],
);

export const organizations = pgTable(
  'organizations',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenants.id),
    businessId: text('business_id'),
    name: text('name').notNull(),
    status: text('status').notNull(),
    createdAt: timestamptz('created_at').notNull(),
    updatedAt: timestamptz('updated_at').notNull(),
  },
  (table) => [index('organizations_tenant_idx').on(table.tenantId)],
);

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').references(() => tenants.id),
    businessId: text('business_id'),
    email: text('email').notNull(),
    name: text('name').notNull(),
    passwordHash: text('password_hash'),
    status: text('status').notNull(),
    createdAt: timestamptz('created_at').notNull(),
    updatedAt: timestamptz('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('users_tenant_email_uidx').on(table.tenantId, table.email),
    uniqueIndex('users_platform_email_uidx')
      .on(table.email)
      .where(sql`${table.tenantId} is null`),
    index('users_tenant_idx').on(table.tenantId),
  ],
);

export const organizationMemberships = pgTable(
  'organization_memberships',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenants.id),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    createdAt: timestamptz('created_at').notNull(),
  },
  (table) => [
    uniqueIndex('organization_memberships_org_user_uidx').on(table.organizationId, table.userId),
    index('organization_memberships_tenant_idx').on(table.tenantId),
  ],
);

export const userRoles = pgTable(
  'user_roles',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').references(() => tenants.id),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    role: text('role').notNull(),
    createdAt: timestamptz('created_at').notNull(),
  },
  (table) => [uniqueIndex('user_roles_user_role_uidx').on(table.userId, table.role)],
);

export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    tenantId: text('tenant_id').references(() => tenants.id),
    expiresAt: timestamptz('expires_at').notNull(),
    createdAt: timestamptz('created_at').notNull(),
    revokedAt: timestamptz('revoked_at'),
  },
  (table) => [index('sessions_user_idx').on(table.userId)],
);

export const userInvitations = pgTable(
  'user_invitations',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenants.id),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    secretHash: text('secret_hash').notNull(),
    expiresAt: timestamptz('expires_at').notNull(),
    consumedAt: timestamptz('consumed_at'),
    createdAt: timestamptz('created_at').notNull(),
  },
  (table) => [index('user_invitations_user_idx').on(table.userId)],
);

export const countries = pgTable(
  'countries',
  {
    id: text('id').primaryKey(),
    isoAlpha2: text('iso_alpha2').notNull(),
    isoAlpha3: text('iso_alpha3').notNull(),
    name: text('name').notNull(),
    isActive: boolean('is_active').notNull(),
  },
  (table) => [uniqueIndex('countries_iso_alpha2_uidx').on(table.isoAlpha2)],
);

export const currencies = pgTable(
  'currencies',
  {
    id: text('id').primaryKey(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    minorUnit: integer('minor_unit').notNull(),
    isActive: boolean('is_active').notNull(),
  },
  (table) => [uniqueIndex('currencies_code_uidx').on(table.code)],
);

export const customers = pgTable(
  'customers',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenants.id),
    organizationId: text('organization_id').references(() => organizations.id),
    businessId: text('business_id'),
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'),
    status: text('status').notNull(),
    createdAt: timestamptz('created_at').notNull(),
    updatedAt: timestamptz('updated_at').notNull(),
  },
  (table) => [
    index('customers_tenant_idx').on(table.tenantId),
    uniqueIndex('customers_tenant_email_uidx')
      .on(table.tenantId, table.email)
      .where(sql`${table.email} is not null`),
  ],
);

export const suppliers = pgTable(
  'suppliers',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenants.id),
    organizationId: text('organization_id').references(() => organizations.id),
    businessId: text('business_id'),
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'),
    status: text('status').notNull(),
    createdAt: timestamptz('created_at').notNull(),
    updatedAt: timestamptz('updated_at').notNull(),
  },
  (table) => [
    index('suppliers_tenant_idx').on(table.tenantId),
    uniqueIndex('suppliers_tenant_email_uidx')
      .on(table.tenantId, table.email)
      .where(sql`${table.email} is not null`),
  ],
);

export const addresses = pgTable(
  'addresses',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenants.id),
    organizationId: text('organization_id').references(() => organizations.id),
    customerId: text('customer_id').references(() => customers.id),
    supplierId: text('supplier_id').references(() => suppliers.id),
    label: text('label'),
    line1: text('line1').notNull(),
    line2: text('line2'),
    city: text('city').notNull(),
    region: text('region'),
    postalCode: text('postal_code'),
    countryId: text('country_id')
      .notNull()
      .references(() => countries.id),
    isPrimary: boolean('is_primary').notNull(),
    createdAt: timestamptz('created_at').notNull(),
    updatedAt: timestamptz('updated_at').notNull(),
  },
  (table) => [
    index('addresses_tenant_idx').on(table.tenantId),
    check(
      'addresses_one_owner',
      sql`(
        (case when ${table.organizationId} is not null then 1 else 0 end) +
        (case when ${table.customerId} is not null then 1 else 0 end) +
        (case when ${table.supplierId} is not null then 1 else 0 end)
      ) = 1`,
    ),
  ],
);

export const auditRecords = pgTable(
  'audit_records',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').references(() => tenants.id),
    actorId: text('actor_id'),
    action: text('action').notNull(),
    entity: text('entity').notNull(),
    entityId: text('entity_id').notNull(),
    occurredAt: timestamptz('occurred_at').notNull(),
    correlationId: text('correlation_id').notNull(),
    oldValue: jsonb('old_value'),
    newValue: jsonb('new_value'),
    ip: text('ip'),
    userAgent: text('user_agent'),
  },
  (table) => [
    index('audit_records_tenant_idx').on(table.tenantId),
    index('audit_records_entity_idx').on(table.entity, table.entityId),
  ],
);

export const schema = {
  systemMeta,
  tenants,
  organizations,
  users,
  organizationMemberships,
  userRoles,
  sessions,
  userInvitations,
  countries,
  currencies,
  customers,
  suppliers,
  addresses,
  auditRecords,
};
