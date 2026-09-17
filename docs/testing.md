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
