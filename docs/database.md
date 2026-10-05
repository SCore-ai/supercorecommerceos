# Database

- Engine: PostgreSQL 17 (Docker)
- ORM: Drizzle
- Migrations: SQL files under `packages/core/drizzle`
- Time: UTC timestamps (`timestamptz`)
- Internal PKs: UUIDv7 generated in the application
- Business IDs: separate, unimplemented numbering in Phase 0
- Money: `numeric(19, 4)` convention; see ADR-007
- No frontend database access
- No production schema sync. Migrations only.
- No destructive migrations without explicit approval.

Phase 0 schema contains `system_meta`.
Phase 1 adds tenants, organisations, users, sessions, invitations, customers, suppliers, addresses, countries, currencies, and audit_records. Migrations live in `packages/core/drizzle` (ADR-009).

Country and currency rows are seeded from ISO 3166-1 and ISO 4217 after migrate.

## Commands

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```
