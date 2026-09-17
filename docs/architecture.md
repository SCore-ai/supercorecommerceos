# Architecture

Phase 0 is a modular monolith.

```
Requirement → Specification → Domain → Application → API → Infrastructure → Database
Supercore Domain → Adapter Interface → External Provider
```

## Runtime layout

- `apps/web`: Next.js operator/web shell
- `apps/admin`: Next.js admin shell
- `apps/api`: Hono + GraphQL Yoga
- `services/worker`: BullMQ worker
- `packages/core`: env, logging, errors, IDs, tenant context, decimal strategy, database, Redis
- Remaining packages: domain or adapter boundaries

Turborepo is not used. pnpm workspaces are the monorepo mechanism.

Microservices, Kubernetes, Kafka, and Shopify are out of scope.

## Canonical ownership

Supercore owns canonical identifiers and domain models.

External systems may later be connected through `packages/integrations` interfaces. They must not become source-of-truth.

See ADRs in `specs/architecture/adr/`.
