import { createSchema, createYoga } from 'graphql-yoga';
import {
  ValidationError,
  getTenantById,
  isTenantStatus,
  isUserStatus,
  listAddressesRecord,
  listAuditRecordsRecord,
  listCountriesRecord,
  listCurrenciesRecord,
  listCustomersRecord,
  listOrganizationsRecord,
  listSuppliersRecord,
  listTenantsRecord,
  createTenantRecord,
  setTenantStatusRecord,
  renameTenantRecord,
  createOrganizationRecord,
  updateOrganizationRecord,
  createCustomerRecord,
  updateCustomerRecord,
  getCustomerRecord,
  createSupplierRecord,
  updateSupplierRecord,
  getSupplierRecord,
  createAddressRecord,
  updateAddressRecord,
  getAddressRecord,
  ownerTypeOf,
  type AuditContext,
} from '@supercore/core';
import {
  assertAddressWrite,
  assignRoles,
  invitePlatformTenantAdmin,
  inviteUser,
  isRoleName,
  listUsersRecord,
  requirePermission,
  requireSuperAdmin,
  requireUser,
  updateUserStatus,
  type CurrentUser,
  type Session,
} from '@supercore/identity';

export type GraphqlContext = {
  user: CurrentUser | null;
  session: Session | null;
  correlationId: string;
  audit: AuditContext;
};

const typeDefs = /* GraphQL */ `
  type Query {
    health: SystemHealth!
    me: Me!
    tenant: Tenant
    tenants(limit: Int, offset: Int): TenantPage!
    organizations(limit: Int, offset: Int): OrganizationPage!
    users(limit: Int, offset: Int): UserPage!
    customers(limit: Int, offset: Int): CustomerPage!
    customer(id: ID!): Customer!
    suppliers(limit: Int, offset: Int): SupplierPage!
    supplier(id: ID!): Supplier!
    addresses(limit: Int, offset: Int): AddressPage!
    countries: [Country!]!
    currencies: [Currency!]!
    auditRecords(limit: Int, offset: Int): AuditPage!
  }

  type Mutation {
    provisionTenant(name: String!, slug: String!): Tenant!
    setTenantStatus(id: ID!, status: String!): Tenant!
    inviteTenantAdmin(tenantId: ID!, email: String!, name: String!): InvitationResult!
    updateTenantName(name: String!, updatedAt: String!): Tenant!
    createOrganization(name: String!): Organization!
    updateOrganization(id: ID!, name: String, status: String, updatedAt: String!): Organization!
    inviteUser(email: String!, name: String!, roles: [String!]!): InvitationResult!
    setUserStatus(id: ID!, status: String!): User!
    assignRoles(userId: ID!, roles: [String!]!): User!
    createCustomer(name: String!, email: String, phone: String, organizationId: ID): Customer!
    updateCustomer(id: ID!, name: String, email: String, phone: String, status: String, organizationId: ID, updatedAt: String!): Customer!
    createSupplier(name: String!, email: String, phone: String, organizationId: ID): Supplier!
    updateSupplier(id: ID!, name: String, email: String, phone: String, status: String, organizationId: ID, updatedAt: String!): Supplier!
    createAddress(
      organizationId: ID
      customerId: ID
      supplierId: ID
      label: String
      line1: String!
      line2: String
      city: String!
      region: String
      postalCode: String
      countryId: ID!
      isPrimary: Boolean
    ): Address!
    updateAddress(
      id: ID!
      label: String
      line1: String
      line2: String
      city: String
      region: String
      postalCode: String
      countryId: ID
      isPrimary: Boolean
      updatedAt: String!
    ): Address!
  }

  type SystemHealth { status: String! service: String! }
  type Me {
    id: ID!
    email: String!
    name: String!
    tenantId: ID
    roles: [String!]!
    permissions: [String!]!
    tenant: Tenant
  }
  type Tenant { id: ID! slug: String! name: String! status: String! businessId: String createdAt: String! updatedAt: String! }
  type Organization { id: ID! tenantId: ID! name: String! status: String! businessId: String createdAt: String! updatedAt: String! }
  type User { id: ID! tenantId: ID email: String! name: String! roles: [String!]! permissions: [String!]! }
  type Customer { id: ID! tenantId: ID! organizationId: ID name: String! email: String phone: String status: String! businessId: String createdAt: String! updatedAt: String! }
  type Supplier { id: ID! tenantId: ID! organizationId: ID name: String! email: String phone: String status: String! businessId: String createdAt: String! updatedAt: String! }
  type Address {
    id: ID! tenantId: ID! organizationId: ID customerId: ID supplierId: ID label: String
    line1: String! line2: String city: String! region: String postalCode: String
    countryId: ID! isPrimary: Boolean! createdAt: String! updatedAt: String!
  }
  type Country { id: ID! isoAlpha2: String! isoAlpha3: String! name: String! isActive: Boolean! }
  type Currency { id: ID! code: String! name: String! minorUnit: Int! isActive: Boolean! }
  type AuditRecord {
    id: ID! tenantId: ID actorId: ID action: String! entity: String! entityId: ID!
    occurredAt: String! correlationId: String!
  }
  type InvitationResult { user: User! invitationSecret: String! }
  type TenantPage { items: [Tenant!]! total: Int! limit: Int! offset: Int! }
  type OrganizationPage { items: [Organization!]! total: Int! limit: Int! offset: Int! }
  type UserPage { items: [User!]! total: Int! limit: Int! offset: Int! }
  type CustomerPage { items: [Customer!]! total: Int! limit: Int! offset: Int! }
  type SupplierPage { items: [Supplier!]! total: Int! limit: Int! offset: Int! }
  type AddressPage { items: [Address!]! total: Int! limit: Int! offset: Int! }
  type AuditPage { items: [AuditRecord!]! total: Int! limit: Int! offset: Int! }
`;

function parseDate(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError('Invalid updatedAt');
  }
  return date;
}

function iso(value: Date): string {
  return value.toISOString();
}

function mapTenant(row: { createdAt: Date; updatedAt: Date }) {
  return { ...row, createdAt: iso(row.createdAt), updatedAt: iso(row.updatedAt) };
}

function mapParty(row: {
  id: string;
  tenantId: string;
  organizationId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  businessId: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return { ...row, createdAt: iso(row.createdAt), updatedAt: iso(row.updatedAt) };
}

const resolvers = {
  Query: {
    health: () => ({ status: 'ok', service: 'api' }),
    me: async (_: unknown, __: unknown, ctx: GraphqlContext) => {
      const user = requireUser(ctx.user);
      const tenant = user.tenantId ? await getTenantById(user.tenantId) : null;
      return {
        ...user,
        tenant: tenant
          ? { ...tenant, createdAt: iso(tenant.createdAt), updatedAt: iso(tenant.updatedAt) }
          : null,
      };
    },
    tenant: async (_: unknown, __: unknown, ctx: GraphqlContext) => {
      const user = requirePermission(ctx.user, 'tenant.read');
      if (!user.tenantId) {
        return null;
      }
      const tenant = await getTenantById(user.tenantId);
      return { ...tenant, createdAt: iso(tenant.createdAt), updatedAt: iso(tenant.updatedAt) };
    },
    tenants: async (_: unknown, args: { limit?: number; offset?: number }, ctx: GraphqlContext) => {
      requireSuperAdmin(ctx.user);
      const page = await listTenantsRecord(args);
      return { ...page, items: page.items.map(mapTenant) };
    },
    organizations: async (_: unknown, args: { limit?: number; offset?: number }, ctx: GraphqlContext) => {
      requirePermission(ctx.user, 'organization.read');
      const page = await listOrganizationsRecord(args);
      return {
        ...page,
        items: page.items.map((row) => ({ ...row, createdAt: iso(row.createdAt), updatedAt: iso(row.updatedAt) })),
      };
    },
    users: async (_: unknown, args: { limit?: number; offset?: number }, ctx: GraphqlContext) => {
      requirePermission(ctx.user, 'user.read');
      return listUsersRecord(args);
    },
    customers: async (_: unknown, args: { limit?: number; offset?: number }, ctx: GraphqlContext) => {
      requirePermission(ctx.user, 'customer.read');
      const page = await listCustomersRecord(args);
      return { ...page, items: page.items.map(mapParty) };
    },
    customer: async (_: unknown, args: { id: string }, ctx: GraphqlContext) => {
      requirePermission(ctx.user, 'customer.read');
      return mapParty(await getCustomerRecord(args.id));
    },
    suppliers: async (_: unknown, args: { limit?: number; offset?: number }, ctx: GraphqlContext) => {
      requirePermission(ctx.user, 'supplier.read');
      const page = await listSuppliersRecord(args);
      return { ...page, items: page.items.map(mapParty) };
    },
    supplier: async (_: unknown, args: { id: string }, ctx: GraphqlContext) => {
      requirePermission(ctx.user, 'supplier.read');
      return mapParty(await getSupplierRecord(args.id));
    },
    addresses: async (_: unknown, args: { limit?: number; offset?: number }, ctx: GraphqlContext) => {
      requireUser(ctx.user);
      const page = await listAddressesRecord(args);
      return {
        ...page,
        items: page.items.map((row) => ({ ...row, createdAt: iso(row.createdAt), updatedAt: iso(row.updatedAt) })),
      };
    },
    countries: async (_: unknown, __: unknown, ctx: GraphqlContext) => {
      requireUser(ctx.user);
      return listCountriesRecord();
    },
    currencies: async (_: unknown, __: unknown, ctx: GraphqlContext) => {
      requireUser(ctx.user);
      return listCurrenciesRecord();
    },
    auditRecords: async (_: unknown, args: { limit?: number; offset?: number }, ctx: GraphqlContext) => {
      const user = requireUser(ctx.user);
      const platform = user.roles.includes('super_admin') && !user.tenantId;
      if (!platform) {
        requirePermission(user, 'audit.read');
      }
      const page = await listAuditRecordsRecord(args, platform);
      return {
        ...page,
        items: page.items.map((row) => ({ ...row, occurredAt: iso(row.occurredAt) })),
      };
    },
  },
  Mutation: {
    provisionTenant: async (_: unknown, args: { name: string; slug: string }, ctx: GraphqlContext) => {
      const actor = requireSuperAdmin(ctx.user);
      const row = await createTenantRecord(args, { ...ctx.audit, actorId: actor.id });
      return { ...row, createdAt: iso(row.createdAt), updatedAt: iso(row.updatedAt) };
    },
    setTenantStatus: async (_: unknown, args: { id: string; status: string }, ctx: GraphqlContext) => {
      const actor = requireSuperAdmin(ctx.user);
      if (!isTenantStatus(args.status)) {
        throw new ValidationError('Invalid tenant status');
      }
      const row = await setTenantStatusRecord(args.id, args.status, { ...ctx.audit, actorId: actor.id });
      return { ...row, createdAt: iso(row.createdAt), updatedAt: iso(row.updatedAt) };
    },
    inviteTenantAdmin: async (
      _: unknown,
      args: { tenantId: string; email: string; name: string },
      ctx: GraphqlContext,
    ) => {
      const actor = requireSuperAdmin(ctx.user);
      const result = await invitePlatformTenantAdmin({ ...args, audit: { ...ctx.audit, actorId: actor.id } });
      return {
        user: {
          id: result.userId,
          tenantId: args.tenantId,
          email: args.email,
          name: args.name,
          roles: ['tenant_admin'],
          permissions: [],
        },
        invitationSecret: result.invitationSecret,
      };
    },
    updateTenantName: async (_: unknown, args: { name: string; updatedAt: string }, ctx: GraphqlContext) => {
      const actor = requirePermission(ctx.user, 'tenant.update');
      const row = await renameTenantRecord(args.name, parseDate(args.updatedAt), { ...ctx.audit, actorId: actor.id });
      return { ...row, createdAt: iso(row.createdAt), updatedAt: iso(row.updatedAt) };
    },
    createOrganization: async (_: unknown, args: { name: string }, ctx: GraphqlContext) => {
      const actor = requirePermission(ctx.user, 'organization.write');
      const row = await createOrganizationRecord(args, { ...ctx.audit, actorId: actor.id });
      return { ...row, createdAt: iso(row.createdAt), updatedAt: iso(row.updatedAt) };
    },
    updateOrganization: async (
      _: unknown,
      args: { id: string; name?: string; status?: string; updatedAt: string },
      ctx: GraphqlContext,
    ) => {
      const actor = requirePermission(ctx.user, 'organization.write');
      const status = args.status === 'archived' || args.status === 'active' ? args.status : undefined;
      const row = await updateOrganizationRecord(
        args.id,
        { name: args.name, status },
        parseDate(args.updatedAt),
        { ...ctx.audit, actorId: actor.id },
      );
      return { ...row, createdAt: iso(row.createdAt), updatedAt: iso(row.updatedAt) };
    },
    inviteUser: async (
      _: unknown,
      args: { email: string; name: string; roles: string[] },
      ctx: GraphqlContext,
    ) => {
      const actor = requirePermission(ctx.user, 'user.write');
      if (args.roles.some((role) => !isRoleName(role))) {
        throw new ValidationError('Invalid role');
      }
      const result = await inviteUser({
        email: args.email,
        name: args.name,
        roles: args.roles.filter(isRoleName),
        audit: { ...ctx.audit, actorId: actor.id },
      });
      return { user: result.user, invitationSecret: result.invitationSecret };
    },
    setUserStatus: async (_: unknown, args: { id: string; status: string }, ctx: GraphqlContext) => {
      const actor = requirePermission(ctx.user, 'user.write');
      if (args.status !== 'active' && args.status !== 'disabled') {
        throw new ValidationError('Invalid user status');
      }
      if (!isUserStatus(args.status)) {
        throw new ValidationError('Invalid user status');
      }
      return updateUserStatus(args.id, args.status, { ...ctx.audit, actorId: actor.id });
    },
    assignRoles: async (_: unknown, args: { userId: string; roles: string[] }, ctx: GraphqlContext) => {
      const actor = requirePermission(ctx.user, 'role.assign');
      return assignRoles(args.userId, args.roles.filter(isRoleName), { ...ctx.audit, actorId: actor.id });
    },
    createCustomer: async (
      _: unknown,
      args: { name: string; email?: string | null; phone?: string | null; organizationId?: string | null },
      ctx: GraphqlContext,
    ) => {
      const actor = requirePermission(ctx.user, 'customer.write');
      return mapParty(await createCustomerRecord(args, { ...ctx.audit, actorId: actor.id }));
    },
    updateCustomer: async (
      _: unknown,
      args: {
        id: string;
        name?: string;
        email?: string | null;
        phone?: string | null;
        status?: string;
        organizationId?: string | null;
        updatedAt: string;
      },
      ctx: GraphqlContext,
    ) => {
      const actor = requirePermission(ctx.user, 'customer.write');
      const status = args.status === 'archived' || args.status === 'active' ? args.status : undefined;
      return mapParty(
        await updateCustomerRecord(
          args.id,
          { name: args.name, email: args.email, phone: args.phone, status, organizationId: args.organizationId },
          parseDate(args.updatedAt),
          { ...ctx.audit, actorId: actor.id },
        ),
      );
    },
    createSupplier: async (
      _: unknown,
      args: { name: string; email?: string | null; phone?: string | null; organizationId?: string | null },
      ctx: GraphqlContext,
    ) => {
      const actor = requirePermission(ctx.user, 'supplier.write');
      return mapParty(await createSupplierRecord(args, { ...ctx.audit, actorId: actor.id }));
    },
    updateSupplier: async (
      _: unknown,
      args: {
        id: string;
        name?: string;
        email?: string | null;
        phone?: string | null;
        status?: string;
        organizationId?: string | null;
        updatedAt: string;
      },
      ctx: GraphqlContext,
    ) => {
      const actor = requirePermission(ctx.user, 'supplier.write');
      const status = args.status === 'archived' || args.status === 'active' ? args.status : undefined;
      return mapParty(
        await updateSupplierRecord(
          args.id,
          { name: args.name, email: args.email, phone: args.phone, status, organizationId: args.organizationId },
          parseDate(args.updatedAt),
          { ...ctx.audit, actorId: actor.id },
        ),
      );
    },
    createAddress: async (
      _: unknown,
      args: {
        organizationId?: string | null;
        customerId?: string | null;
        supplierId?: string | null;
        label?: string | null;
        line1: string;
        line2?: string | null;
        city: string;
        region?: string | null;
        postalCode?: string | null;
        countryId: string;
        isPrimary?: boolean | null;
      },
      ctx: GraphqlContext,
    ) => {
      const actor = requireUser(ctx.user);
      assertAddressWrite(actor, ownerTypeOf(args));
      const row = await createAddressRecord({ ...args, isPrimary: Boolean(args.isPrimary) }, { ...ctx.audit, actorId: actor.id });
      return { ...row, createdAt: iso(row.createdAt), updatedAt: iso(row.updatedAt) };
    },
    updateAddress: async (
      _: unknown,
      args: {
        id: string;
        label?: string | null;
        line1?: string;
        line2?: string | null;
        city?: string;
        region?: string | null;
        postalCode?: string | null;
        countryId?: string;
        isPrimary?: boolean | null;
        updatedAt: string;
      },
      ctx: GraphqlContext,
    ) => {
      const actor = requireUser(ctx.user);
      const existing = await getAddressRecord(args.id);
      assertAddressWrite(actor, ownerTypeOf(existing));
      const row = await updateAddressRecord(
        args.id,
        {
          label: args.label,
          line1: args.line1,
          line2: args.line2,
          city: args.city,
          region: args.region,
          postalCode: args.postalCode,
          countryId: args.countryId,
          isPrimary: args.isPrimary ?? undefined,
        },
        parseDate(args.updatedAt),
        { ...ctx.audit, actorId: actor.id },
      );
      return { ...row, createdAt: iso(row.createdAt), updatedAt: iso(row.updatedAt) };
    },
  },
};

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  graphqlEndpoint: '/graphql',
  landingPage: false,
  graphiql: false,
  maskedErrors: process.env.NODE_ENV === 'production',
});

export async function executeGraphql(
  input: {
    query: string;
    variables?: Record<string, unknown>;
    operationName?: string;
  },
  context: GraphqlContext,
) {
  const enveloped = yoga.getEnveloped();
  const document = enveloped.parse(input.query);
  const errors = enveloped.validate(enveloped.schema, document);
  if (errors.length > 0) {
    return { errors };
  }
  return enveloped.execute({
    schema: enveloped.schema,
    document,
    variableValues: input.variables,
    operationName: input.operationName,
    contextValue: context,
  });
}
