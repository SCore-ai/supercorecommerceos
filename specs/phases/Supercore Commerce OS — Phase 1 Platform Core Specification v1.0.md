# SUPERCORE COMMERCE OS

## Phase 1 — Platform Core Specification v1.0

**Document type:** Implementation specification  
**Status:** Draft — §17 blockers closed 2026-10-05; coding still requires explicit approval  
**Depends on:** Phase 0 complete  
**Does not include:** Commerce, CRM, accounting, tax, inventory, payments, AI agents  
**Date:** 2026-09-17  
**§17 closed:** 2026-10-05 (ADR-006 amendment, ADR-009)

---

# 1. Purpose

Phase 1 creates the first real domain in Supercore Commerce OS: the **platform core**.

After Phase 1, the system can:

- create and isolate tenants
- store organisations inside a tenant
- authenticate users
- enforce RBAC
- store customers and suppliers as master data
- store addresses, countries, and currencies
- persist an audit trail

Phase 1 does not sell products, take payments, post invoices, or manage stock.

Vendure, ERPNext, and Frappe CRM are not installed in this phase. There is no Vendure phase and no ERPNext phase anywhere in the roadmap.

Comparison clones under `references/` are not used as the identity or tenant model. First-party auth stays in this spec. See `specs/architecture/Supercore Commerce OS — External Reference Clones v1.0.md`.

---

# 2. Goals

1. Replace the Phase 0 unauthenticated default with a real first-party identity implementation.
2. Persist tenant-aware core entities in PostgreSQL using Drizzle migrations.
3. Enforce tenant isolation in every query path.
4. Provide API and admin surfaces for core records.
5. Leave commerce, CRM, and finance domains empty.

---

# 3. Non-goals

Do not implement in Phase 1:

- Product, variant, catalog, cart, checkout, order
- Lead, opportunity, pipeline, quote
- Invoice, ledger, VAT, tax engine
- Stock, warehouse, reservation
- Purchase orders
- Payment gateway charges
- HMRC submission
- AI agents
- SSO / social login / third-party IdP coupling
- Multi-currency price lists
- Customer credit limits, payment terms, or tax categories as business rules
- Historical data migration
- Vendure, ERPNext, Frappe CRM, or Shopify installation or implementation

---

# 4. Architecture constraints

Phase 1 must obey existing ADRs:

| ADR | Constraint |
|---|---|
| ADR-001 | Modular monolith. No new microservices. |
| ADR-002 | Supercore owns canonical data. Vendure/ERPNext/Frappe are optional unscheduled adapters only. External IDs are never PKs. |
| ADR-003 | Internal PK is UUIDv7. `businessId` is separate and nullable. |
| ADR-004 | Adapters remain interfaces only. |
| ADR-005 | GraphQL for application API. REST for health/webhooks/ops. |
| ADR-006 | `tenantId` comes from session or internal jobs, never from untrusted client input. |
| ADR-007 | No money calculations in Phase 1. If a monetary field is deferred, do not store it as `number`. |
| ADR-008 | Cursor implements production code. Lovable prototypes UI only. Aider is small patches. Spec first. Tests required. |
| ADR-009 | Single Drizzle schema in `@supercore/core`. Identity owns auth/session/RBAC behavior. Customer/supplier/address are core master data, not commerce/CRM. |

Packages:

- `@supercore/core` — IDs, tenant context, errors, db, audit persistence, tenant/org/customer/supplier/address/country/currency
- `@supercore/identity` — auth, session, RBAC, invite/activate (imports core; core never imports identity)
- Customer/supplier/address **must not** live in `@supercore/commerce` or `@supercore/crm`.
- `apps/api` — application services and API
- `apps/admin` — management UI
- `apps/web` — signed-in shell only; no storefront catalog

---

# 5. Multi-tenancy model

## 5.1 Tenant

A tenant is the SaaS isolation boundary.

A tenant has:

- `id` (UUIDv7)
- `businessId` (nullable)
- `slug` (unique, public login key — not `tenantId`)
- `name`
- `status` (`active` \| `suspended` \| `provisioning`)
- `createdAt` / `updatedAt` (UTC)

`slug` is lowercase `[a-z0-9]` plus hyphen, length 3–63, no leading/trailing hyphen. Super Admin sets it while `provisioning`. After the tenant becomes `active`, slug is immutable. Clients never send `id` as an isolation header (ADR-006).

All tenant-owned rows include `tenantId`.

Queries must run inside `TenantContext`.
A missing tenant context is an authorization failure, except for platform-scoped Super Admin operations listed in section 7.

## 5.2 Organization

An organisation belongs to exactly one tenant.

A tenant may have many organisations.

An organisation has:

- `id`
- `tenantId`
- `businessId` (nullable)
- `name`
- `status` (`active` \| `archived`)
- `createdAt` / `updatedAt`

Phase 1 does not invent organisation hierarchies, branches, or franchise rules.
If a parent organisation is needed later, that requires an ADR.

## 5.3 Membership

A user belongs to exactly one tenant.

A user may belong to zero or more organisations in that tenant through `organization_membership`.

Platform Super Admin accounts are not tenant members. See section 7.

---

# 6. Identity and authentication

## 6.1 Decision

Phase 1 implements **Supercore first-party authentication**.

It must not couple the domain to Auth0, Clerk, Cognito, NextAuth-as-product, or any other vendor.

The Phase 0 `AuthProvider` interface remains the boundary.
Phase 1 adds a `SupercoreAuthProvider` that reads a server session.

## 6.2 User

A user has:

- `id`
- `tenantId` (null only for platform Super Admin)
- `businessId` (nullable)
- `email` (unique per tenant; unique globally for platform Super Admin)
- `name`
- `passwordHash`
- `status` (`active` \| `disabled` \| `invited`)
- `createdAt` / `updatedAt`

Email is stored lowercase trimmed.
Password is hashed with Node `crypto.scrypt` using the parameters in §17.6. Argon2 is not added in Phase 1.
Plaintext passwords are never logged or returned.

## 6.3 Session

Sessions are server-side.

A session has:

- `id`
- `userId`
- `tenantId` (null for platform Super Admin)
- `expiresAt`
- `createdAt`
- `revokedAt` (nullable)

The session cookie uses the Phase 0 cookie helper:

- `httpOnly`
- `secure` in production
- `sameSite=lax`
- `path=/`

Client applications do not supply `tenantId`.
After login, tenant context is taken from the session.

## 6.4 Auth API

Phase 1 REST/GraphQL operations:

- sign in (rules in §17.1): tenant user = email + password + `tenantSlug`; Super Admin = email + password with no slug
- activate invited user (email + `tenantSlug` + one-time secret + new password)
- sign out
- read current user
- change own password when authenticated

Phase 1 does not include:

- password reset email product
- magic links
- MFA
- passkeys
- OAuth

Those require a later identity spec.

## 6.5 Invitation

A tenant admin may create a user with status `invited` and a one-time activation secret (§17.6).
Phase 1 returns the secret once to the caller (and may write it to the local logging sink in development). Outbound email is out of scope.

---

# 7. RBAC

## 7.1 Roles

Phase 0 roles remain the only role names:

- `super_admin` — platform operator, not a tenant role
- `tenant_admin`
- `manager`
- `sales`
- `finance`
- `procurement`
- `warehouse`
- `support`
- `viewer`

A user may have multiple tenant roles.
`super_admin` cannot be assigned as a tenant role.

## 7.2 Permission model

Permissions are strings of the form `resource.action`.

Phase 1 implements the **model and enforcement**, not the future commerce catalogue.

Phase 1 permissions:

| Permission | Meaning |
|---|---|
| `tenant.read` | Read current tenant |
| `tenant.update` | Tenant admin: update current tenant **name** only. Status and slug are Super Admin platform operations, not this permission. |
| `organization.read` | Read organisations |
| `organization.write` | Create/update organisations |
| `user.read` | Read users in tenant |
| `user.write` | Invite/update/disable tenant users |
| `role.assign` | Assign tenant roles |
| `customer.read` | Read customers |
| `customer.write` | Create/update customers |
| `supplier.read` | Read suppliers |
| `supplier.write` | Create/update suppliers |
| `address.write` | Necessary but not sufficient to mutate an address; owner-type rules in §17.2 |
| `audit.read` | Read audit records |

Role defaults for Phase 1:

| Role | Permissions |
|---|---|
| `super_admin` | platform tenant provisioning + read any audit with platform context |
| `tenant_admin` | all Phase 1 tenant permissions |
| `manager` | all read + customer/supplier write + `address.write` (owner-type rules in §17.2); no `role.assign`; no `organization.write` |
| `sales` | `customer.read`, `customer.write`, `address.write`, `organization.read` |
| `finance` | read customers/suppliers/audit |
| `procurement` | `supplier.read`, `supplier.write`, `address.write` |
| `warehouse` | read customers/suppliers |
| `support` | read users/customers/suppliers |
| `viewer` | read-only core records except `audit.read` |

Do not add product/order/invoice permissions in Phase 1.

## 7.3 Enforcement

Every mutating application service calls `requirePermission`.
GraphQL resolvers and REST handlers must not check roles ad hoc.
Frontend hiding is not security.

Every read/list/detail/audit path also calls `requirePermission` for the matching `*.read` (or `audit.read`). Writes protected and reads open is forbidden.

Tenant-owned queries always add `tenantId = TenantContext.tenantId`. Missing tenant context is `AuthorizationError`, except Super Admin platform operations listed in section 7.

PostgreSQL RLS is not used in Phase 1. Isolation is application-layer + tests.

Pagination is required on all list endpoints.

---

# 8. Master data

## 8.1 Country

Reference data. Not tenant-owned.

- `id`
- `isoAlpha2` (unique)
- `isoAlpha3`
- `name`
- `isActive`

Populate from ISO 3166-1. Do not invent country lists.

## 8.2 Currency

Reference data. Not tenant-owned.

- `id`
- `code` (ISO 4217, unique, 3 letters)
- `name`
- `minorUnit`
- `isActive`

Populate from ISO 4217. Do not invent currency rounding or pricing rules.
Phase 1 does not convert money.

## 8.3 Address

Tenant-owned.

- `id`
- `tenantId`
- `organizationId` (nullable)
- `customerId` (nullable)
- `supplierId` (nullable)
- `label` (nullable)
- `line1`
- `line2` (nullable)
- `city`
- `region` (nullable)
- `postalCode` (nullable)
- `countryId`
- `isPrimary`
- `createdAt` / `updatedAt`

An address belongs to at most one of organisation, customer, or supplier.
Exactly one owner is required.

Owner-type, reassignment, primary, and organisation scope: §17.2.

No geocoding. No tax jurisdiction engine.

## 8.4 Customer

Tenant-owned **party master data** only.

- `id`
- `tenantId`
- `organizationId` (nullable)
- `businessId` (nullable)
- `name`
- `email` (nullable)
- `phone` (nullable)
- `status` (`active` \| `archived`)
- `createdAt` / `updatedAt`

No orders, no cart, no credit limit, no tax number validation rules, no duplicate-match engine beyond exact email uniqueness per tenant when email is present.

## 8.5 Supplier

Tenant-owned **party master data** only.

- `id`
- `tenantId`
- `organizationId` (nullable)
- `businessId` (nullable)
- `name`
- `email` (nullable)
- `phone` (nullable)
- `status` (`active` \| `archived`)
- `createdAt` / `updatedAt`

No purchase orders, no payment terms, no lead-time rules.

Customer and supplier are separate tables. A later ADR may introduce a shared Party model if duplication becomes harmful.

---

# 9. Audit

Phase 0 defined the record shape. Phase 1 persists it.

Table `audit_records`:

- `id`
- `tenantId` (nullable for platform actions)
- `actorId` (nullable for system)
- `action`
- `entity`
- `entityId`
- `occurredAt`
- `correlationId`
- `oldValue` (JSONB, nullable)
- `newValue` (JSONB, nullable)
- `ip` (nullable)
- `userAgent` (nullable)

Rules:

- Write audit records for create/update/disable of tenant, organisation, user, role assignment, customer, supplier, address.
- Domain mutation and the audit insert run in the **same database transaction**. Either both commit or neither does. See §17.5.
- Do not store passwords, password hashes, or invitation secrets in `oldValue` / `newValue`.
- Do not delete audit rows in Phase 1.
- Audit is append-only.
- No transactional outbox in Phase 1.

---

# 10. Identifiers

- Primary keys: UUIDv7 via `createInternalId()`.
- `businessId` column exists and remains nullable.
- Do not implement `SC-CUS-000001` sequential numbering in Phase 1.
- External provider ID columns are not added in Phase 1.

---

# 11. API

## 11.1 GraphQL

Add application types for:

- `me`
- Tenant
- Organization
- User
- Role assignment
- Customer
- Supplier
- Address
- Country
- Currency
- AuditRecord (read)

Keep the Phase 0 `health` query.

No product/order/invoice types.

## 11.2 REST

Keep `/health`, `/ready`, `/live`.

Auth endpoints may be REST:

- `POST /auth/sign-in`
- `POST /auth/sign-out`
- `GET /auth/me`

## 11.3 Layering

```
API
 → Application service
 → Domain
 → Repository
 → Database
```

No SQL in resolvers.
No tenantId argument from the client for isolation.

---

# 12. User interface

Frontend is presentation only. Business rules stay in the API.

Pipeline (ADR-008):

```
Requirement → Spec → Lovable → UI/UX prototype → Next.js / Tailwind / shadcn
        → Cursor → production apps/web + apps/admin
```

Lovable does **not** write identity, RBAC, or tenant isolation. Cursor ports accepted screens and wires HTTP/GraphQL.

Canonical agent roles: `specs/architecture/Supercore Commerce OS — Development Agent Architecture v1.0.md`.
Paste-in prompt: `docs/lovable-brief.md`.

## 12.1 Admin (`apps/admin`)

Replace the Phase 0 placeholder with working screens:

- Sign in
- Dashboard / home shell (no commerce widgets)
- Tenant settings (current tenant)
- Organisations (table, filters, form)
- Users and roles (table, form)
- Customers (list, detail, form)
- Suppliers (list, detail, form)
- Addresses
- Audit log (permission gated, read-only table)

Shared UI work: navigation, visual hierarchy, empty/error/loading states, responsive layout.

No commerce, CRM pipeline, invoice, stock, or AI modules in navigation.

## 12.2 Web (`apps/web`)

Sign-in and a signed-in home that shows current user + tenant name.
No catalog.

## 12.3 Lovable vs Cursor vs Aider (this phase)

| Tool | This phase |
|---|---|
| Lovable | Prototype the screens in 12.1–12.2 only |
| Cursor | Auth, session, RBAC, APIs, port UI, Playwright |
| Aider | Optional small patch after Cursor lands the feature |

Lovable output is discarded if it invents catalog, checkout, invoices, or a new API schema.

---

# 13. Data rules

- PostgreSQL + Drizzle migrations only.
- UTC timestamps.
- Soft archive via `status` / `archived` for organisation, customer, and supplier. Do not hard-delete customers, suppliers, users, or audit rows.
- Users are not archived. Users use `invited` / `active` / `disabled` only (§17.3).
- Unique customer email per tenant when email is not null.
- Unique user email per tenant (and unique globally among Super Admin accounts).
- All list endpoints paginate.
- Seed countries and currencies in a migration or a repeatable seed script.

---

# 14. Testing

Minimum:

1. Sign-in success and failure (tenant user requires `tenantSlug`; Super Admin has no slug)
2. Session cookie is httpOnly
3. Client-supplied tenantId is rejected
4. User from tenant A cannot read tenant B customers
5. Viewer cannot write customers
6. Tenant admin can create customer and address
7. Audit row is written on customer create (same transaction)
8. Super Admin cannot be assigned as a tenant role
9. GraphQL `me` requires authentication
10. Admin sign-in page loads (Playwright)
11. Sales cannot write a supplier address
12. Last active `tenant_admin` cannot be disabled

---

# 15. Definition of done

Phase 1 is complete only when:

- [x] Section 17 blockers are closed by product/security (ADR-006 amendment, ADR-009)
- [ ] Migrations create the Phase 1 tables
- [ ] First-party sign-in works
- [ ] Tenant context is session-derived
- [ ] RBAC denies unauthorised writes
- [ ] Customer and supplier CRUD works inside a tenant
- [ ] Address CRUD works
- [ ] Country and currency reference data is available
- [ ] Audit records persist
- [ ] Admin screens exist for the entities above (production UI in this repo, not a Lovable-only export)
- [ ] Lint, typecheck, unit, integration, and relevant e2e tests pass
- [ ] No commerce/CRM/accounting logic was added
- [ ] Documentation is updated
- [ ] No business logic in `apps/web` / `apps/admin`

---

# 16. Decisions taken in this spec

These are Phase 1 decisions. Changing them requires an ADR.

1. Authentication is first-party email/password + server session.
2. A user belongs to one tenant.
3. An organisation belongs to one tenant.
4. Super Admin is platform-scoped, not a tenant role.
5. Customer and supplier are separate master-data tables.
6. Sequential business numbering is still not implemented.
7. No outbound email product in Phase 1.
8. Tenant users sign in with email + password + public `tenantSlug`. Super Admin signs in with email + password only. Email stays unique per tenant, not globally (ADR-006 amendment).
9. Package split is ADR-009: one Drizzle tree in core; identity owns auth behavior.
10. `address.write` is composed with owner-type write permissions (§17.2).
11. Tenant status transitions and user `invited`/`active`/`disabled` follow §17.3. There is no User `archived` state.
12. Mutation + audit share one database transaction. No outbox in Phase 1 (§17.5).
13. Session, invite, CSRF, and scrypt parameters follow §17.6.

---

# 17. Closed items (were blockers; do not re-open in code)

Closed 2026-10-05. Comparison clones were **looked up**, not copied. Specs and ADRs win.

| Lookup | Path | Used as |
|---|---|---|
| Vendure user identifier | `references/vendure/packages/core/src/entity/user/user.entity.ts`, `.../service/services/user.service.ts` | Contrast: global identifier lookup. **Rejected** (would reverse unique-per-tenant and decision 2). |
| Vendure password | `references/vendure/packages/core/src/config/auth/bcrypt-password-hashing-strategy.ts` | Contrast: bcrypt. Phase 1 stays Node `scrypt` as already specified. |
| Vendure address | `references/vendure/packages/core/src/entity/address/address.entity.ts` | Contrast: customer-only address. Supercore keeps three owner types. |
| Frappe User | `references/frappe/frappe/core/doctype/user/user.json` | Contrast: site-global User + `enabled`. Not our SaaS tenant model. Invite/session ideas stayed in this spec, not their DocType. |
| ERPNext Company | `references/erpnext/erpnext/setup/doctype/company/company.json` | Contrast: legal-entity/CoA company, not SaaS `tenant`. |

If implementation needs a rule that is **not** in this document (including §17 subsections below), stop and ask.

## 17.1 Sign-in principal — closed

Keep: email unique per tenant; Super Admin email unique among Super Admin accounts; client never sends `tenantId`.

Resolution:

1. Tenant row has public `slug` (§5.1).
2. `POST /auth/sign-in` for a **tenant user** requires `email`, `password`, `tenantSlug`. Lookup: tenant by slug, then user where `tenantId` = that tenant and email matches. **One** password verification.
3. `POST /auth/sign-in` **without** `tenantSlug` looks up **only** Super Admin users (`tenantId` is null). It must not search tenant users.
4. Unknown tenant, unknown email, wrong password, user not `active`, tenant not `active`: same generic authentication failure. Optional dummy `scrypt` verify on miss so timing is not an oracle.
5. Forbidden: first-match across tenants; verify password against more than one stored hash; silent global email uniqueness.

## 17.2 `address.write` — closed

`address.write` is required to create or update an address. It is not enough.

| Owner | Also required | Who has it in Phase 1 defaults |
|---|---|---|
| Customer | `customer.write` | `tenant_admin`, `manager`, `sales` |
| Supplier | `supplier.write` | `tenant_admin`, `manager`, `procurement` |
| Organisation | `organization.write` | `tenant_admin` (not `manager` unless `organization.write` is granted later) |

Sales must not write supplier or organisation addresses. Procurement must not write customer or organisation addresses.

Organisation **membership is not an extra ACL in Phase 1**. If the actor has the owner-type write permission, they may write that owner’s addresses anywhere in the tenant. Narrower org-scoped ACL needs a later ADR (likely Phase 3).

Reassignment: an address cannot change owner type or owner id. Create a new address on the new owner. Do not “move”.

Primary: at most one `isPrimary = true` per (`tenantId`, owner type, owner id). Setting a new primary clears the previous row in the **same transaction**. Zero primaries is allowed.

## 17.3 Lifecycle — closed

**Tenant** status is a Super Admin platform operation. `tenant.update` does not change status or slug.

| From | To | Who |
|---|---|---|
| `provisioning` | `active` | Super Admin |
| `active` | `suspended` | Super Admin |
| `suspended` | `active` | Super Admin |

No other tenant transitions. No return to `provisioning`. No `archived` tenant.

Effects:

- `provisioning`: tenant users cannot sign in or activate. Super Admin may finish setup (name, slug, first tenant_admin).
- `active`: tenant users with status `active` may sign in.
- `suspended`: tenant-user authenticate fails with the generic failure. Existing tenant sessions are treated as revoked when read (check tenant status). Worker jobs for that tenant are skipped (log, do not run domain work). Super Admin may still read the tenant.

**User** statuses only: `invited`, `active`, `disabled`. There is no User `archived`.

| From | To | Who / how |
|---|---|---|
| `invited` | `active` | Consume invitation (§17.6) |
| `invited` | `disabled` | `user.write` (cancel invite) |
| `active` | `disabled` | `user.write` |
| `disabled` | `active` | `user.write` (does not restore revoked sessions) |

TenantAdmin does not suspend or reinstate **tenants**. They may disable/re-enable **users** subject to last-admin rules (§17.6).

## 17.4 Package ownership — closed

ADR-009. One arrangement for the whole phase.

## 17.5 Mutation + audit — closed

- Use one PostgreSQL transaction for the domain write and the audit insert. Audit failure rolls back the mutation.
- Updates: optimistic concurrency on `updatedAt` (compare incoming expected value; zero rows → `ConflictError`). No `SELECT FOR UPDATE` requirement in Phase 1.
- Unique violations (email, slug) → `ConflictError`.
- No outbox table, no “audit later” queue, no duplicate event bus as source of truth.
- After **successful commit**, in-process events from `@supercore/events` are optional and must not replace the audit row.

## 17.6 Session / invite / CSRF / scrypt — closed

**Password**

- Length 12–128 Unicode characters. No extra composition theatre.
- Node `crypto.scrypt`: N = 16384, r = 8, p = 1, keylen = 64, salt = 16 random bytes.
- Store `salt` and derived key in `passwordHash` (hex or base64url, documented in code). Timing-safe compare.
- No argon2 dependency in Phase 1.

**Password change**

- Authenticated user only; verify current password.
- Revoke **all** sessions for that user (`revokedAt`), then create a **new** session for this request.

**Session**

- `expiresAt` = createdAt + 12 hours. No sliding expiry in Phase 1.
- Cookie: existing Phase 0 helper (`httpOnly`, `secure` in production, `sameSite=lax`, `path=/`).
- Suspended tenant or disabled user: treat session as unauthenticated.

**Invitation**

- 32 random bytes, presented once as base64url.
- Persist SHA-256 of the secret (not scrypt). Never store plaintext.
- `expiresAt` = createdAt + 72 hours. Single use.
- Reuse of spent, expired, or unknown secret: same validation failure as invalid secret.
- Activate: email + `tenantSlug` + secret + new password. Tenant must be `active`. User must be `invited`.

**Last admin / self-lockout**

- A tenant must keep at least one **active** user with role `tenant_admin`.
- Refuse disable, role removal, or status change that would drop that count to zero (including acting on yourself).
- Super Admin is not a substitute last tenant_admin.

**CSRF / origin**

- Cookie-authenticated `POST`/`PUT`/`PATCH`/`DELETE` (REST and GraphQL) require `Origin` matching the allow-list from `CORS_ORIGINS`, `WEB_URL`, `ADMIN_URL`, and `API_URL`. If `Origin` is absent, `Referer` host+scheme must match the same list. Otherwise reject.
- Health/live/ready stay unauthenticated and are not cookie session mutations.

**Still out of this phase:** MFA, OAuth, passkeys, password-reset mail, custom roles.

Also still out of scope until asked:

- How tenants are billed
- Whether one email may join many tenants (would need an ADR reversing decision 2)
- Customer tax numbers and validation
- Supplier bank accounts
- Password reset mail
- Custom roles beyond the Phase 0 list
- Subdomain-based slug resolution (form field `tenantSlug` is the Phase 1 mechanism)
- PostgreSQL RLS
