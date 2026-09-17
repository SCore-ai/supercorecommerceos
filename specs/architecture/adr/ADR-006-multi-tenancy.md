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
