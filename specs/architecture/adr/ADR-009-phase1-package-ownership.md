# ADR-009 Phase 1 package ownership

## Context

Phase 1 Platform Core Specification §17 required one documented home for tenant-owned master data versus identity. Splitting ownership differently per task would create duplicate tables and illegal cross-package imports.

`@supercore/identity` may depend on `@supercore/core`. `@supercore/core` must not depend on identity. Domain packages must not own customer/supplier/address in Phase 1.

## Decision

Phase 1 uses **one Drizzle schema and migrator** in `@supercore/core`.

Logical ownership:

| Package | Owns (behavior + types used by apps) | Physical tables (in core schema) |
|---|---|---|
| `@supercore/core` | Tenant, organization, customer, supplier, address, country, currency, audit persistence, tenant context, IDs, errors, db | `tenants`, `organizations`, `organization_memberships`, `customers`, `suppliers`, `addresses`, `countries`, `currencies`, `audit_records`, plus identity tables below so there is a single migration tree |
| `@supercore/identity` | Auth provider, password hashing, sessions, RBAC, invite/activate/disable user | `users`, `sessions`, `user_roles`, `user_invitations` (names may match the migration) |

Rules:

- Identity services import core. Core never imports identity.
- Customer, supplier, and address **must not** live in `@supercore/commerce` or `@supercore/crm`.
- `apps/api` application services compose core + identity. Resolvers do not own SQL.
- `organization_memberships` is stored with core organisations. Phase 1 does not use membership as an extra ACL (see Phase 1 spec §17.2). Identity may write membership rows.

## Alternatives

- Separate Drizzle migrator in identity: rejected; two migration runners in Phase 1 is unnecessary.
- Put customers in identity because they have email: rejected; they are party master data, not login principals.
- Shared Party table now: rejected; Phase 1 spec keeps separate customer and supplier tables until a later ADR.

## Consequences

Phase 1 coding follows this split. Changing it requires a new ADR. Comparison clones under `references/` do not dictate package layout.
