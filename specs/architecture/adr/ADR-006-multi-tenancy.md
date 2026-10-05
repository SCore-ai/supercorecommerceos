# ADR-006 Multi-tenancy

## Context

The product will be multi-tenant SaaS. Tenant isolation cannot be bolted on later as an afterthought.

## Decision

- `TenantContext` is stored in `AsyncLocalStorage`.
- `tenantId` must come from authenticated session context or an internal job.
- Client-supplied `tenantId` query/header values are rejected.
- Organization is a typed boundary, not a Phase 0 table.
- Auth is an `AuthProvider` interface. The default is unauthenticated. A local bypass exists only when `AUTH_DEV_BYPASS=true` and `NODE_ENV` is not production.

## Alternatives

- Trust tenant IDs from the client: rejected
- Bind the domain to a specific IdP now: rejected
- Skip tenant context until SaaS launch: rejected

## Consequences

Phase 1 tables that represent tenant-owned entities should include `tenantId` and queries must run inside tenant context.

## Amendment (2026-10-05)

Sign-in for tenant users may accept a public **`tenantSlug`**. That value is not `tenantId`, not a UUID, and not a client isolation header.

- Tenant users: email + password + `tenantSlug` → look up tenant by slug, then that tenant’s user by email. One password check.
- Platform Super Admin: email + password with **no** slug → Super Admin users only (`tenantId` null).
- After success, `TenantContext.tenantId` still comes only from the server session (or `internal` jobs).
- Super Admin platform routes may use a tenant **resource id** in the path when provisioning. That is not tenant-user isolation input.

This does not reverse “a user belongs to one tenant”. It does not make email globally unique.
