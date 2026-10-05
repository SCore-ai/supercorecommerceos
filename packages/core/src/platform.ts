import { and, count, desc, eq } from 'drizzle-orm';
import { ConflictError, NotFoundError, ValidationError } from './errors.js';
import { createInternalId } from './ids.js';
import { parsePage, type Page, type PageInput } from './pagination.js';
import { requireTenantContext } from './tenant.js';
import { getRequestContext } from './correlation.js';
import {
  assertTenantStatusTransition,
  type ArchiveStatus,
  type TenantStatus,
} from './lifecycle.js';
import { parseTenantSlug } from './slug.js';
import { getDb } from './db/client.js';
import { insertAuditRecord } from './db/audit-store.js';
import {
  addresses,
  auditRecords,
  countries,
  currencies,
  customers,
  organizations,
  suppliers,
  tenants,
} from './db/schema.js';

export type AuditContext = {
  actorId: string | null;
  ip?: string;
  userAgent?: string;
};

type CoreTx = Parameters<Parameters<ReturnType<typeof getDb>['transaction']>[0]>[0];

function now(): Date {
  return new Date();
}

function correlationId(): string {
  return getRequestContext()?.correlationId ?? 'internal';
}

function rethrowUnique(error: unknown, message: string): never {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  if (code === '23505') {
    throw new ConflictError(message);
  }
  throw error;
}

export async function createTenantRecord(input: { name: string; slug: string }, audit: AuditContext) {
  const slug = parseTenantSlug(input.slug);
  const name = input.name.trim();
  if (name.length < 1) {
    throw new ValidationError('Tenant name is required');
  }
  const db = getDb();
  const occurredAt = now();
  const row = {
    id: createInternalId(),
    businessId: null,
    slug,
    name,
    status: 'provisioning' as TenantStatus,
    createdAt: occurredAt,
    updatedAt: occurredAt,
  };
  try {
    await db.transaction(async (tx: CoreTx) => {
      await tx.insert(tenants).values(row);
      await insertAuditRecord(tx, {
        actorId: audit.actorId,
        tenantId: row.id,
        action: 'create',
        entity: 'tenant',
        entityId: row.id,
        occurredAt,
        correlationId: correlationId(),
        newValue: { slug: row.slug, name: row.name, status: row.status },
        ip: audit.ip,
        userAgent: audit.userAgent,
      });
    });
  } catch (error) {
    rethrowUnique(error, 'Tenant slug already exists');
  }
  return row;
}

export async function setTenantStatusRecord(
  tenantId: string,
  next: TenantStatus,
  audit: AuditContext,
) {
  const db = getDb();
  const existing = await db.select().from(tenants).where(eq(tenants.id, tenantId)).then((rows) => rows[0]);
  if (!existing) {
    throw new NotFoundError('Tenant not found');
  }
  assertTenantStatusTransition(existing.status as TenantStatus, next);
  const occurredAt = now();
  await db.transaction(async (tx: CoreTx) => {
    await tx
      .update(tenants)
      .set({ status: next, updatedAt: occurredAt })
      .where(eq(tenants.id, tenantId));
    await insertAuditRecord(tx, {
      actorId: audit.actorId,
      tenantId,
      action: 'update',
      entity: 'tenant',
      entityId: tenantId,
      occurredAt,
      correlationId: correlationId(),
      oldValue: { status: existing.status },
      newValue: { status: next },
      ip: audit.ip,
      userAgent: audit.userAgent,
    });
  });
  return { ...existing, status: next, updatedAt: occurredAt };
}

export async function renameTenantRecord(name: string, expectedUpdatedAt: Date, audit: AuditContext) {
  const tenant = requireTenantContext();
  const trimmed = name.trim();
  if (trimmed.length < 1) {
    throw new ValidationError('Tenant name is required');
  }
  const db = getDb();
  const occurredAt = now();
  const updated = await db.transaction(async (tx: CoreTx) => {
    const existing = await tx.select().from(tenants).where(eq(tenants.id, tenant.tenantId)).then((rows) => rows[0]);
    if (!existing) {
      throw new NotFoundError('Tenant not found');
    }
    if (existing.updatedAt.getTime() !== expectedUpdatedAt.getTime()) {
      throw new ConflictError('Tenant was updated by another request');
    }
    await tx.update(tenants).set({ name: trimmed, updatedAt: occurredAt }).where(eq(tenants.id, tenant.tenantId));
    await insertAuditRecord(tx, {
      actorId: audit.actorId,
      tenantId: tenant.tenantId,
      action: 'update',
      entity: 'tenant',
      entityId: tenant.tenantId,
      occurredAt,
      correlationId: correlationId(),
      oldValue: { name: existing.name },
      newValue: { name: trimmed },
      ip: audit.ip,
      userAgent: audit.userAgent,
    });
    return { ...existing, name: trimmed, updatedAt: occurredAt };
  });
  return updated;
}

export async function getTenantById(tenantId: string) {
  const row = await getDb().select().from(tenants).where(eq(tenants.id, tenantId)).then((rows) => rows[0]);
  if (!row) {
    throw new NotFoundError('Tenant not found');
  }
  return row;
}

export async function getTenantBySlug(slug: string) {
  return getDb().select().from(tenants).where(eq(tenants.slug, slug)).then((rows) => rows[0]);
}

export async function listTenantsRecord(page: PageInput): Promise<Page<(typeof tenants)['$inferSelect']>> {
  const { limit, offset } = parsePage(page);
  const db = getDb();
  const [items, totalRow] = await Promise.all([
    db.select().from(tenants).orderBy(desc(tenants.createdAt)).limit(limit).offset(offset),
    db.select({ value: count() }).from(tenants),
  ]);
  return { items, total: Number(totalRow[0]?.value ?? 0), limit, offset };
}

export async function listOrganizationsRecord(page: PageInput) {
  const tenant = requireTenantContext();
  const { limit, offset } = parsePage(page);
  const db = getDb();
  const where = eq(organizations.tenantId, tenant.tenantId);
  const [items, totalRow] = await Promise.all([
    db.select().from(organizations).where(where).orderBy(desc(organizations.createdAt)).limit(limit).offset(offset),
    db.select({ value: count() }).from(organizations).where(where),
  ]);
  return { items, total: Number(totalRow[0]?.value ?? 0), limit, offset };
}

export async function createOrganizationRecord(input: { name: string }, audit: AuditContext) {
  const tenant = requireTenantContext();
  const name = input.name.trim();
  if (name.length < 1) {
    throw new ValidationError('Organization name is required');
  }
  const occurredAt = now();
  const row = {
    id: createInternalId(),
    tenantId: tenant.tenantId,
    businessId: null,
    name,
    status: 'active' as ArchiveStatus,
    createdAt: occurredAt,
    updatedAt: occurredAt,
  };
  await getDb().transaction(async (tx: CoreTx) => {
    await tx.insert(organizations).values(row);
    await insertAuditRecord(tx, {
      actorId: audit.actorId,
      tenantId: tenant.tenantId,
      action: 'create',
      entity: 'organization',
      entityId: row.id,
      occurredAt,
      correlationId: correlationId(),
      newValue: { name: row.name, status: row.status },
      ip: audit.ip,
      userAgent: audit.userAgent,
    });
  });
  return row;
}

export async function updateOrganizationRecord(
  id: string,
  input: { name?: string; status?: ArchiveStatus },
  expectedUpdatedAt: Date,
  audit: AuditContext,
) {
  const tenant = requireTenantContext();
  const db = getDb();
  return db.transaction(async (tx: CoreTx) => {
    const existing = await tx
      .select()
      .from(organizations)
      .where(and(eq(organizations.id, id), eq(organizations.tenantId, tenant.tenantId)))
      .then((rows) => rows[0]);
    if (!existing) {
      throw new NotFoundError('Organization not found');
    }
    if (existing.updatedAt.getTime() !== expectedUpdatedAt.getTime()) {
      throw new ConflictError('Organization was updated by another request');
    }
    const occurredAt = now();
    const name = input.name?.trim() ?? existing.name;
    const status = input.status ?? (existing.status as ArchiveStatus);
    await tx
      .update(organizations)
      .set({ name, status, updatedAt: occurredAt })
      .where(eq(organizations.id, id));
    await insertAuditRecord(tx, {
      actorId: audit.actorId,
      tenantId: tenant.tenantId,
      action: 'update',
      entity: 'organization',
      entityId: id,
      occurredAt,
      correlationId: correlationId(),
      oldValue: { name: existing.name, status: existing.status },
      newValue: { name, status },
      ip: audit.ip,
      userAgent: audit.userAgent,
    });
    return { ...existing, name, status, updatedAt: occurredAt };
  });
}

type PartyTable = typeof customers | typeof suppliers;

async function listParty(table: PartyTable, page: PageInput) {
  const tenant = requireTenantContext();
  const { limit, offset } = parsePage(page);
  const db = getDb();
  const where = eq(table.tenantId, tenant.tenantId);
  const [items, totalRow] = await Promise.all([
    db.select().from(table).where(where).orderBy(desc(table.createdAt)).limit(limit).offset(offset),
    db.select({ value: count() }).from(table).where(where),
  ]);
  return { items, total: Number(totalRow[0]?.value ?? 0), limit, offset };
}

async function getParty(table: PartyTable, id: string, label: string) {
  const tenant = requireTenantContext();
  const row = await getDb()
    .select()
    .from(table)
    .where(and(eq(table.id, id), eq(table.tenantId, tenant.tenantId)))
    .then((rows) => rows[0]);
  if (!row) {
    throw new NotFoundError(`${label} not found`);
  }
  return row;
}

async function createParty(
  table: PartyTable,
  entity: 'customer' | 'supplier',
  input: { name: string; email?: string | null; phone?: string | null; organizationId?: string | null },
  audit: AuditContext,
) {
  const tenant = requireTenantContext();
  const name = input.name.trim();
  if (name.length < 1) {
    throw new ValidationError(`${entity} name is required`);
  }
  const email = input.email?.trim().toLowerCase() || null;
  const occurredAt = now();
  const row = {
    id: createInternalId(),
    tenantId: tenant.tenantId,
    organizationId: input.organizationId ?? null,
    businessId: null,
    name,
    email,
    phone: input.phone?.trim() || null,
    status: 'active' as ArchiveStatus,
    createdAt: occurredAt,
    updatedAt: occurredAt,
  };
  try {
    await getDb().transaction(async (tx: CoreTx) => {
      await tx.insert(table).values(row);
      await insertAuditRecord(tx, {
        actorId: audit.actorId,
        tenantId: tenant.tenantId,
        action: 'create',
        entity,
        entityId: row.id,
        occurredAt,
        correlationId: correlationId(),
        newValue: { name, email, status: row.status },
        ip: audit.ip,
        userAgent: audit.userAgent,
      });
    });
  } catch (error) {
    rethrowUnique(error, `${entity} email already exists in this tenant`);
  }
  return row;
}

async function updateParty(
  table: PartyTable,
  entity: 'customer' | 'supplier',
  id: string,
  input: { name?: string; email?: string | null; phone?: string | null; status?: ArchiveStatus; organizationId?: string | null },
  expectedUpdatedAt: Date,
  audit: AuditContext,
) {
  const tenant = requireTenantContext();
  try {
    return await getDb().transaction(async (tx: CoreTx) => {
      const existing = await tx
        .select()
        .from(table)
        .where(and(eq(table.id, id), eq(table.tenantId, tenant.tenantId)))
        .then((rows) => rows[0]);
      if (!existing) {
        throw new NotFoundError(`${entity} not found`);
      }
      if (existing.updatedAt.getTime() !== expectedUpdatedAt.getTime()) {
        throw new ConflictError(`${entity} was updated by another request`);
      }
      const occurredAt = now();
      const name = input.name?.trim() ?? existing.name;
      const email = input.email === undefined ? existing.email : input.email?.trim().toLowerCase() || null;
      const phone = input.phone === undefined ? existing.phone : input.phone?.trim() || null;
      const status = input.status ?? (existing.status as ArchiveStatus);
      const organizationId = input.organizationId === undefined ? existing.organizationId : input.organizationId;
      await tx
        .update(table)
        .set({ name, email, phone, status, organizationId, updatedAt: occurredAt })
        .where(eq(table.id, id));
      await insertAuditRecord(tx, {
        actorId: audit.actorId,
        tenantId: tenant.tenantId,
        action: status === 'archived' && existing.status !== 'archived' ? 'disable' : 'update',
        entity,
        entityId: id,
        occurredAt,
        correlationId: correlationId(),
        oldValue: { name: existing.name, email: existing.email, status: existing.status },
        newValue: { name, email, status },
        ip: audit.ip,
        userAgent: audit.userAgent,
      });
      return { ...existing, name, email, phone, status, organizationId, updatedAt: occurredAt };
    });
  } catch (error) {
    rethrowUnique(error, `${entity} email already exists in this tenant`);
  }
}

export const listCustomersRecord = (page: PageInput) => listParty(customers, page);
export const getCustomerRecord = (id: string) => getParty(customers, id, 'Customer');
export const createCustomerRecord = (
  input: { name: string; email?: string | null; phone?: string | null; organizationId?: string | null },
  audit: AuditContext,
) => createParty(customers, 'customer', input, audit);
export const updateCustomerRecord = (
  id: string,
  input: { name?: string; email?: string | null; phone?: string | null; status?: ArchiveStatus; organizationId?: string | null },
  expectedUpdatedAt: Date,
  audit: AuditContext,
) => updateParty(customers, 'customer', id, input, expectedUpdatedAt, audit);

export const listSuppliersRecord = (page: PageInput) => listParty(suppliers, page);
export const getSupplierRecord = (id: string) => getParty(suppliers, id, 'Supplier');
export const createSupplierRecord = (
  input: { name: string; email?: string | null; phone?: string | null; organizationId?: string | null },
  audit: AuditContext,
) => createParty(suppliers, 'supplier', input, audit);
export const updateSupplierRecord = (
  id: string,
  input: { name?: string; email?: string | null; phone?: string | null; status?: ArchiveStatus; organizationId?: string | null },
  expectedUpdatedAt: Date,
  audit: AuditContext,
) => updateParty(suppliers, 'supplier', id, input, expectedUpdatedAt, audit);

export type AddressOwner = { organizationId?: string | null; customerId?: string | null; supplierId?: string | null };

export function ownerTypeOf(owner: AddressOwner): 'organization' | 'customer' | 'supplier' {
  const flags = [Boolean(owner.organizationId), Boolean(owner.customerId), Boolean(owner.supplierId)].filter(Boolean);
  if (flags.length !== 1) {
    throw new ValidationError('Address requires exactly one owner');
  }
  if (owner.customerId) {
    return 'customer';
  }
  if (owner.supplierId) {
    return 'supplier';
  }
  return 'organization';
}

export async function listAddressesRecord(page: PageInput) {
  const tenant = requireTenantContext();
  const { limit, offset } = parsePage(page);
  const db = getDb();
  const where = eq(addresses.tenantId, tenant.tenantId);
  const [items, totalRow] = await Promise.all([
    db.select().from(addresses).where(where).orderBy(desc(addresses.createdAt)).limit(limit).offset(offset),
    db.select({ value: count() }).from(addresses).where(where),
  ]);
  return { items, total: Number(totalRow[0]?.value ?? 0), limit, offset };
}

export async function getAddressRecord(id: string) {
  const tenant = requireTenantContext();
  const row = await getDb()
    .select()
    .from(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.tenantId, tenant.tenantId)))
    .then((rows) => rows[0]);
  if (!row) {
    throw new NotFoundError('Address not found');
  }
  return row;
}

async function clearPrimary(
  tx: CoreTx,
  tenantId: string,
  owner: AddressOwner,
): Promise<void> {
  if (owner.customerId) {
    await tx
      .update(addresses)
      .set({ isPrimary: false, updatedAt: now() })
      .where(and(eq(addresses.tenantId, tenantId), eq(addresses.customerId, owner.customerId), eq(addresses.isPrimary, true)));
  } else if (owner.supplierId) {
    await tx
      .update(addresses)
      .set({ isPrimary: false, updatedAt: now() })
      .where(and(eq(addresses.tenantId, tenantId), eq(addresses.supplierId, owner.supplierId), eq(addresses.isPrimary, true)));
  } else if (owner.organizationId) {
    await tx
      .update(addresses)
      .set({ isPrimary: false, updatedAt: now() })
      .where(
        and(eq(addresses.tenantId, tenantId), eq(addresses.organizationId, owner.organizationId), eq(addresses.isPrimary, true)),
      );
  }
}

export async function createAddressRecord(
  input: AddressOwner & {
    label?: string | null;
    line1: string;
    line2?: string | null;
    city: string;
    region?: string | null;
    postalCode?: string | null;
    countryId: string;
    isPrimary?: boolean;
  },
  audit: AuditContext,
) {
  const tenant = requireTenantContext();
  ownerTypeOf(input);
  if (!input.line1.trim() || !input.city.trim()) {
    throw new ValidationError('Address line1 and city are required');
  }
  const occurredAt = now();
  const row = {
    id: createInternalId(),
    tenantId: tenant.tenantId,
    organizationId: input.organizationId ?? null,
    customerId: input.customerId ?? null,
    supplierId: input.supplierId ?? null,
    label: input.label?.trim() || null,
    line1: input.line1.trim(),
    line2: input.line2?.trim() || null,
    city: input.city.trim(),
    region: input.region?.trim() || null,
    postalCode: input.postalCode?.trim() || null,
    countryId: input.countryId,
    isPrimary: Boolean(input.isPrimary),
    createdAt: occurredAt,
    updatedAt: occurredAt,
  };
  await getDb().transaction(async (tx: CoreTx) => {
    if (row.isPrimary) {
      await clearPrimary(tx, tenant.tenantId, input);
    }
    await tx.insert(addresses).values(row);
    await insertAuditRecord(tx, {
      actorId: audit.actorId,
      tenantId: tenant.tenantId,
      action: 'create',
      entity: 'address',
      entityId: row.id,
      occurredAt,
      correlationId: correlationId(),
      newValue: { line1: row.line1, city: row.city, isPrimary: row.isPrimary },
      ip: audit.ip,
      userAgent: audit.userAgent,
    });
  });
  return row;
}

export async function updateAddressRecord(
  id: string,
  input: {
    label?: string | null;
    line1?: string;
    line2?: string | null;
    city?: string;
    region?: string | null;
    postalCode?: string | null;
    countryId?: string;
    isPrimary?: boolean;
  },
  expectedUpdatedAt: Date,
  audit: AuditContext,
) {
  const tenant = requireTenantContext();
  return getDb().transaction(async (tx: CoreTx) => {
    const existing = await tx
      .select()
      .from(addresses)
      .where(and(eq(addresses.id, id), eq(addresses.tenantId, tenant.tenantId)))
      .then((rows) => rows[0]);
    if (!existing) {
      throw new NotFoundError('Address not found');
    }
    if (existing.updatedAt.getTime() !== expectedUpdatedAt.getTime()) {
      throw new ConflictError('Address was updated by another request');
    }
    const occurredAt = now();
    const next = {
      label: input.label === undefined ? existing.label : input.label?.trim() || null,
      line1: input.line1?.trim() ?? existing.line1,
      line2: input.line2 === undefined ? existing.line2 : input.line2?.trim() || null,
      city: input.city?.trim() ?? existing.city,
      region: input.region === undefined ? existing.region : input.region?.trim() || null,
      postalCode: input.postalCode === undefined ? existing.postalCode : input.postalCode?.trim() || null,
      countryId: input.countryId ?? existing.countryId,
      isPrimary: input.isPrimary ?? existing.isPrimary,
      updatedAt: occurredAt,
    };
    if (next.isPrimary && !existing.isPrimary) {
      await clearPrimary(tx, tenant.tenantId, existing);
    }
    await tx.update(addresses).set(next).where(eq(addresses.id, id));
    await insertAuditRecord(tx, {
      actorId: audit.actorId,
      tenantId: tenant.tenantId,
      action: 'update',
      entity: 'address',
      entityId: id,
      occurredAt,
      correlationId: correlationId(),
      oldValue: { line1: existing.line1, isPrimary: existing.isPrimary },
      newValue: { line1: next.line1, isPrimary: next.isPrimary },
      ip: audit.ip,
      userAgent: audit.userAgent,
    });
    return { ...existing, ...next };
  });
}

export async function listCountriesRecord() {
  return getDb().select().from(countries).orderBy(countries.name);
}

export async function listCurrenciesRecord() {
  return getDb().select().from(currencies).orderBy(currencies.code);
}

export async function listAuditRecordsRecord(page: PageInput, platformAll = false) {
  const { limit, offset } = parsePage(page);
  const db = getDb();
  if (platformAll) {
    const [items, totalRow] = await Promise.all([
      db.select().from(auditRecords).orderBy(desc(auditRecords.occurredAt)).limit(limit).offset(offset),
      db.select({ value: count() }).from(auditRecords),
    ]);
    return { items, total: Number(totalRow[0]?.value ?? 0), limit, offset };
  }
  const tenant = requireTenantContext();
  const where = eq(auditRecords.tenantId, tenant.tenantId);
  const [items, totalRow] = await Promise.all([
    db.select().from(auditRecords).where(where).orderBy(desc(auditRecords.occurredAt)).limit(limit).offset(offset),
    db.select({ value: count() }).from(auditRecords).where(where),
  ]);
  return { items, total: Number(totalRow[0]?.value ?? 0), limit, offset };
}
