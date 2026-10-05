import { and, count, desc, eq, isNull } from 'drizzle-orm';
import {
  AuthenticationError,
  BusinessRuleError,
  ConflictError,
  getRequestContext,
  NotFoundError,
  SESSION_TTL_SECONDS,
  ValidationError,
  createInternalId,
  getDb,
  insertAuditRecord,
  parsePage,
  parseTenantSlug,
  requireTenantContext,
  tenantAllowsSignIn,
  userAllowsSignIn,
  type AuditContext,
  type PageInput,
  type UserStatus,
  sessions,
  tenants,
  userInvitations,
  userRoles,
  users,
} from '@supercore/core';
import {
  assertPasswordPolicy,
  createInvitationSecret,
  dummyPasswordCheck,
  hashInvitationSecret,
  hashPassword,
  verifyPassword,
} from './password.js';
import { isRoleName } from './rbac.js';
import { type CurrentUser, type RoleName, type Session, permissionsForRoles } from './types.js';

type CoreTx = Parameters<Parameters<ReturnType<typeof getDb>['transaction']>[0]>[0];

const INVITE_TTL_MS = 72 * 60 * 60 * 1000;
const GENERIC_AUTH = 'Invalid credentials';

function now(): Date {
  return new Date();
}

function correlationIdFromAudit(_audit: AuditContext): string {
  return getRequestContext()?.correlationId ?? 'internal';
}

function rethrowUnique(error: unknown, message: string): never {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  if (code === '23505') {
    throw new ConflictError(message);
  }
  throw error;
}

export async function loadRoles(userId: string): Promise<RoleName[]> {
  const rows = await getDb().select().from(userRoles).where(eq(userRoles.userId, userId));
  return rows.map((row) => row.role).filter(isRoleName);
}

export async function toCurrentUser(row: typeof users.$inferSelect): Promise<CurrentUser> {
  const roles = await loadRoles(row.id);
  return {
    id: row.id,
    tenantId: row.tenantId,
    email: row.email,
    name: row.name,
    roles,
    permissions: permissionsForRoles(roles),
  };
}

export async function countActiveTenantAdmins(tenantId: string): Promise<number> {
  const db = getDb();
  const admins = await db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .innerJoin(users, eq(users.id, userRoles.userId))
    .where(and(eq(userRoles.role, 'tenant_admin'), eq(users.tenantId, tenantId), eq(users.status, 'active')));
  return new Set(admins.map((row) => row.userId)).size;
}

export async function assertNotLastTenantAdmin(tenantId: string, userId: string): Promise<void> {
  const roles = await loadRoles(userId);
  if (!roles.includes('tenant_admin')) {
    return;
  }
  const n = await countActiveTenantAdmins(tenantId);
  if (n <= 1) {
    throw new BusinessRuleError('A tenant must keep at least one active tenant_admin');
  }
}

export async function createSessionForUser(user: CurrentUser): Promise<{ id: string; expiresAt: Date }> {
  const occurredAt = now();
  const expiresAt = new Date(occurredAt.getTime() + SESSION_TTL_SECONDS * 1000);
  const id = createInternalId();
  await getDb().insert(sessions).values({
    id,
    userId: user.id,
    tenantId: user.tenantId,
    expiresAt,
    createdAt: occurredAt,
    revokedAt: null,
  });
  return { id, expiresAt };
}

export async function revokeAllSessions(userId: string): Promise<void> {
  await getDb()
    .update(sessions)
    .set({ revokedAt: now() })
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
}

export async function loadSession(sessionId: string): Promise<Session | null> {
  const db = getDb();
  const sessionRow = await db.select().from(sessions).where(eq(sessions.id, sessionId)).then((rows) => rows[0]);
  if (!sessionRow || sessionRow.revokedAt) {
    return null;
  }
  if (sessionRow.expiresAt.getTime() <= Date.now()) {
    return null;
  }
  const userRow = await db.select().from(users).where(eq(users.id, sessionRow.userId)).then((rows) => rows[0]);
  if (!userRow || !userAllowsSignIn(userRow.status as UserStatus)) {
    return null;
  }
  if (userRow.tenantId) {
    const tenant = await db.select().from(tenants).where(eq(tenants.id, userRow.tenantId)).then((rows) => rows[0]);
    if (!tenant || !tenantAllowsSignIn(tenant.status as 'provisioning' | 'active' | 'suspended')) {
      return null;
    }
    const current = await toCurrentUser(userRow);
    return {
      user: current,
      tenant: { tenantId: tenant.id, source: 'session' },
    };
  }
  const current = await toCurrentUser(userRow);
  if (!current.roles.includes('super_admin')) {
    return null;
  }
  return { user: current, tenant: null };
}

async function failAuth(password: string): Promise<never> {
  await dummyPasswordCheck(password);
  throw new AuthenticationError(GENERIC_AUTH);
}

export async function signIn(input: {
  email: string;
  password: string;
  tenantSlug?: string | null;
}): Promise<{ sessionId: string; user: CurrentUser; tenantName: string | null }> {
  const email = input.email.trim().toLowerCase();
  const db = getDb();
  if (input.tenantSlug && input.tenantSlug.trim() !== '') {
    const slug = parseTenantSlug(input.tenantSlug);
    const tenant = await db.select().from(tenants).where(eq(tenants.slug, slug)).then((rows) => rows[0]);
    if (!tenant || !tenantAllowsSignIn(tenant.status as 'provisioning' | 'active' | 'suspended')) {
      return failAuth(input.password);
    }
    const userRow = await db
      .select()
      .from(users)
      .where(and(eq(users.tenantId, tenant.id), eq(users.email, email)))
      .then((rows) => rows[0]);
    if (!userRow || !userRow.passwordHash || !userAllowsSignIn(userRow.status as UserStatus)) {
      return failAuth(input.password);
    }
    const ok = await verifyPassword(input.password, userRow.passwordHash);
    if (!ok) {
      throw new AuthenticationError(GENERIC_AUTH);
    }
    const user = await toCurrentUser(userRow);
    const session = await createSessionForUser(user);
    return { sessionId: session.id, user, tenantName: tenant.name };
  }

  const userRow = await db
    .select()
    .from(users)
    .where(and(isNull(users.tenantId), eq(users.email, email)))
    .then((rows) => rows[0]);
  if (!userRow || !userRow.passwordHash || !userAllowsSignIn(userRow.status as UserStatus)) {
    return failAuth(input.password);
  }
  const ok = await verifyPassword(input.password, userRow.passwordHash);
  if (!ok) {
    throw new AuthenticationError(GENERIC_AUTH);
  }
  const user = await toCurrentUser(userRow);
  if (!user.roles.includes('super_admin')) {
    throw new AuthenticationError(GENERIC_AUTH);
  }
  const session = await createSessionForUser(user);
  return { sessionId: session.id, user, tenantName: null };
}

export async function changePassword(user: CurrentUser, currentPassword: string, nextPassword: string): Promise<{ sessionId: string }> {
  assertPasswordPolicy(nextPassword);
  const db = getDb();
  const row = await db.select().from(users).where(eq(users.id, user.id)).then((rows) => rows[0]);
  if (!row?.passwordHash || !(await verifyPassword(currentPassword, row.passwordHash))) {
    throw new AuthenticationError(GENERIC_AUTH);
  }
  const passwordHash = await hashPassword(nextPassword);
  await db.update(users).set({ passwordHash, updatedAt: now() }).where(eq(users.id, user.id));
  await revokeAllSessions(user.id);
  const session = await createSessionForUser(user);
  return { sessionId: session.id };
}

export async function inviteUser(input: {
  email: string;
  name: string;
  roles: RoleName[];
  audit: AuditContext;
}): Promise<{ user: CurrentUser; invitationSecret: string }> {
  const tenant = requireTenantContext();
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!email || !name) {
    throw new ValidationError('email and name are required');
  }
  if (input.roles.includes('super_admin')) {
    throw new BusinessRuleError('super_admin cannot be assigned as a tenant role');
  }
  if (input.roles.length < 1) {
    throw new ValidationError('At least one role is required');
  }
  const occurredAt = now();
  const userId = createInternalId();
  const { secret, hash } = createInvitationSecret();
  try {
    await getDb().transaction(async (tx: CoreTx) => {
      await tx.insert(users).values({
        id: userId,
        tenantId: tenant.tenantId,
        businessId: null,
        email,
        name,
        passwordHash: null,
        status: 'invited',
        createdAt: occurredAt,
        updatedAt: occurredAt,
      });
      for (const role of input.roles) {
        await tx.insert(userRoles).values({
          id: createInternalId(),
          tenantId: tenant.tenantId,
          userId,
          role,
          createdAt: occurredAt,
        });
      }
      await tx.insert(userInvitations).values({
        id: createInternalId(),
        tenantId: tenant.tenantId,
        userId,
        secretHash: hash,
        expiresAt: new Date(occurredAt.getTime() + INVITE_TTL_MS),
        consumedAt: null,
        createdAt: occurredAt,
      });
      await insertAuditRecord(tx, {
        actorId: input.audit.actorId,
        tenantId: tenant.tenantId,
        action: 'create',
        entity: 'user',
        entityId: userId,
        occurredAt,
        correlationId: correlationIdFromAudit(input.audit),
        newValue: { email, name, status: 'invited', roles: input.roles },
        ip: input.audit.ip,
        userAgent: input.audit.userAgent,
      });
    });
  } catch (error) {
    rethrowUnique(error, 'User email already exists in this tenant');
  }
  const user = await toCurrentUser((await getDb().select().from(users).where(eq(users.id, userId)))[0]!);
  return { user, invitationSecret: secret };
}

export async function invitePlatformTenantAdmin(input: {
  tenantId: string;
  email: string;
  name: string;
  audit: AuditContext;
}): Promise<{ invitationSecret: string; userId: string }> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const tenant = await getDb().select().from(tenants).where(eq(tenants.id, input.tenantId)).then((rows) => rows[0]);
  if (!tenant) {
    throw new NotFoundError('Tenant not found');
  }
  const occurredAt = now();
  const userId = createInternalId();
  const { secret, hash } = createInvitationSecret();
  try {
    await getDb().transaction(async (tx: CoreTx) => {
      await tx.insert(users).values({
        id: userId,
        tenantId: tenant.id,
        businessId: null,
        email,
        name,
        passwordHash: null,
        status: 'invited',
        createdAt: occurredAt,
        updatedAt: occurredAt,
      });
      await tx.insert(userRoles).values({
        id: createInternalId(),
        tenantId: tenant.id,
        userId,
        role: 'tenant_admin',
        createdAt: occurredAt,
      });
      await tx.insert(userInvitations).values({
        id: createInternalId(),
        tenantId: tenant.id,
        userId,
        secretHash: hash,
        expiresAt: new Date(occurredAt.getTime() + INVITE_TTL_MS),
        consumedAt: null,
        createdAt: occurredAt,
      });
      await insertAuditRecord(tx, {
        actorId: input.audit.actorId,
        tenantId: tenant.id,
        action: 'create',
        entity: 'user',
        entityId: userId,
        occurredAt,
        correlationId: correlationIdFromAudit(input.audit),
        newValue: { email, name, status: 'invited', roles: ['tenant_admin'] },
        ip: input.audit.ip,
        userAgent: input.audit.userAgent,
      });
    });
  } catch (error) {
    rethrowUnique(error, 'User email already exists in this tenant');
  }
  return { invitationSecret: secret, userId };
}

export async function activateUser(input: {
  email: string;
  tenantSlug: string;
  secret: string;
  password: string;
}): Promise<{ sessionId: string; user: CurrentUser }> {
  assertPasswordPolicy(input.password);
  const email = input.email.trim().toLowerCase();
  const slug = parseTenantSlug(input.tenantSlug);
  const db = getDb();
  const tenant = await db.select().from(tenants).where(eq(tenants.slug, slug)).then((rows) => rows[0]);
  if (!tenant || !tenantAllowsSignIn(tenant.status as 'provisioning' | 'active' | 'suspended')) {
    throw new ValidationError('Invalid invitation');
  }
  const userRow = await db
    .select()
    .from(users)
    .where(and(eq(users.tenantId, tenant.id), eq(users.email, email)))
    .then((rows) => rows[0]);
  if (!userRow || userRow.status !== 'invited') {
    throw new ValidationError('Invalid invitation');
  }
  const invite = await db
    .select()
    .from(userInvitations)
    .where(eq(userInvitations.userId, userRow.id))
    .orderBy(desc(userInvitations.createdAt))
    .then((rows) => rows[0]);
  const hash = hashInvitationSecret(input.secret);
  if (!invite || invite.consumedAt || invite.expiresAt.getTime() <= Date.now() || invite.secretHash !== hash) {
    throw new ValidationError('Invalid invitation');
  }
  const passwordHash = await hashPassword(input.password);
  const occurredAt = now();
  await db.transaction(async (tx: CoreTx) => {
    await tx
      .update(users)
      .set({ passwordHash, status: 'active', updatedAt: occurredAt })
      .where(eq(users.id, userRow.id));
    await tx.update(userInvitations).set({ consumedAt: occurredAt }).where(eq(userInvitations.id, invite.id));
    await insertAuditRecord(tx, {
      actorId: userRow.id,
      tenantId: tenant.id,
      action: 'update',
      entity: 'user',
      entityId: userRow.id,
      occurredAt,
      correlationId: 'activate',
      oldValue: { status: 'invited' },
      newValue: { status: 'active' },
    });
  });
  const user = await toCurrentUser({ ...userRow, status: 'active', passwordHash });
  const session = await createSessionForUser(user);
  return { sessionId: session.id, user };
}

export async function updateUserStatus(
  userId: string,
  status: Extract<UserStatus, 'active' | 'disabled'>,
  audit: AuditContext,
): Promise<CurrentUser> {
  const tenant = requireTenantContext();
  const db = getDb();
  const existing = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userId), eq(users.tenantId, tenant.tenantId)))
    .then((rows) => rows[0]);
  if (!existing) {
    throw new NotFoundError('User not found');
  }
  if (status === 'disabled' && existing.status === 'active') {
    await assertNotLastTenantAdmin(tenant.tenantId, userId);
  }
  const occurredAt = now();
  await db.transaction(async (tx: CoreTx) => {
    await tx.update(users).set({ status, updatedAt: occurredAt }).where(eq(users.id, userId));
    if (status === 'disabled') {
      await tx.update(sessions).set({ revokedAt: occurredAt }).where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
    }
    await insertAuditRecord(tx, {
      actorId: audit.actorId,
      tenantId: tenant.tenantId,
      action: status === 'disabled' ? 'disable' : 'update',
      entity: 'user',
      entityId: userId,
      occurredAt,
      correlationId: correlationIdFromAudit(audit),
      oldValue: { status: existing.status },
      newValue: { status },
      ip: audit.ip,
      userAgent: audit.userAgent,
    });
  });
  return toCurrentUser({ ...existing, status, updatedAt: occurredAt });
}

export async function assignRoles(
  userId: string,
  roles: RoleName[],
  audit: AuditContext,
): Promise<CurrentUser> {
  const tenant = requireTenantContext();
  if (roles.includes('super_admin')) {
    throw new BusinessRuleError('super_admin cannot be assigned as a tenant role');
  }
  if (roles.length < 1) {
    throw new ValidationError('At least one role is required');
  }
  const db = getDb();
  const existing = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userId), eq(users.tenantId, tenant.tenantId)))
    .then((rows) => rows[0]);
  if (!existing) {
    throw new NotFoundError('User not found');
  }
  const currentRoles = await loadRoles(userId);
  if (currentRoles.includes('tenant_admin') && !roles.includes('tenant_admin') && existing.status === 'active') {
    await assertNotLastTenantAdmin(tenant.tenantId, userId);
  }
  const occurredAt = now();
  await db.transaction(async (tx: CoreTx) => {
    await tx.delete(userRoles).where(eq(userRoles.userId, userId));
    for (const role of roles) {
      await tx.insert(userRoles).values({
        id: createInternalId(),
        tenantId: tenant.tenantId,
        userId,
        role,
        createdAt: occurredAt,
      });
    }
    await insertAuditRecord(tx, {
      actorId: audit.actorId,
      tenantId: tenant.tenantId,
      action: 'update',
      entity: 'user',
      entityId: userId,
      occurredAt,
      correlationId: correlationIdFromAudit(audit),
      oldValue: { roles: currentRoles },
      newValue: { roles },
      ip: audit.ip,
      userAgent: audit.userAgent,
    });
  });
  return toCurrentUser(existing);
}

export async function listUsersRecord(page: PageInput) {
  const tenant = requireTenantContext();
  const { limit, offset } = parsePage(page);
  const db = getDb();
  const where = eq(users.tenantId, tenant.tenantId);
  const [items, totalRow] = await Promise.all([
    db.select().from(users).where(where).orderBy(desc(users.createdAt)).limit(limit).offset(offset),
    db.select({ value: count() }).from(users).where(where),
  ]);
  const mapped = await Promise.all(items.map((row) => toCurrentUser(row)));
  return { items: mapped, total: Number(totalRow[0]?.value ?? 0), limit, offset };
}

export async function bootstrapSuperAdmin(email: string, password: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const existing = await getDb().select().from(users).where(and(isNull(users.tenantId), eq(users.email, normalized)));
  if (existing.length > 0) {
    return;
  }
  assertPasswordPolicy(password);
  const occurredAt = now();
  const userId = createInternalId();
  await getDb().transaction(async (tx: CoreTx) => {
    await tx.insert(users).values({
      id: userId,
      tenantId: null,
      businessId: null,
      email: normalized,
      name: 'Super Admin',
      passwordHash: await hashPassword(password),
      status: 'active',
      createdAt: occurredAt,
      updatedAt: occurredAt,
    });
    await tx.insert(userRoles).values({
      id: createInternalId(),
      tenantId: null,
      userId,
      role: 'super_admin',
      createdAt: occurredAt,
    });
  });
}
