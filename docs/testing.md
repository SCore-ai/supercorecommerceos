# Testing

- Unit: Vitest
- E2E: Playwright
- Integration: Vitest with `RUN_INTEGRATION=1`

Phase 0 coverage includes:

- environment validation
- error model
- tenant context
- UUIDv7 IDs
- event metadata
- API health / live / GraphQL
- PostgreSQL and Redis connectivity when Docker is available
- BullMQ `system.health.check`
- web and admin shells

Phase 1 adds:

- tenant slug parsing
- origin allow-list
- tenant lifecycle transitions
- scrypt password hashing
- RBAC owner-type address writes
- GraphQL `me` requires authentication
- integration (Docker): tenant isolation, last tenant_admin lockout
