# ADR-001 Modular monolith

## Context

Supercore Commerce OS needs a long-lived foundation. Microservices would add operational cost before any domain exists.

## Decision

Use a pnpm-workspace modular monolith.

- `apps/*` for runnable UI/API
- `packages/*` for domain and platform modules
- `services/worker` for background jobs
- No Turborepo
- No microservices in Phase 0

## Alternatives

- Microservices from day one: rejected as premature
- Turborepo: rejected; pnpm scripts are enough
- Single package: rejected; module boundaries would be weaker

## Consequences

Modules can later become services only with an ADR. Cross-package imports must follow documented boundaries.
