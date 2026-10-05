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

Vendure, ERPNext, and Frappe CRM are not runtimes in this repository. They may exist later only as optional adapters.

Read-only clones for comparison: `references/`. Binding map: `specs/architecture/Supercore Commerce OS — External Reference Clones v1.0.md`. Canonical code remains `apps/` and `packages/`.

## Canonical ownership

Supercore owns canonical identifiers, domain models, and engines (Commerce, CRM, Accounting, Tax).

External systems may later be connected through `packages/integrations` interfaces. They must not become source-of-truth.

Authoritative phase order: `specs/phases/Supercore Commerce OS — Product Vision and Phase Roadmap v1.1.md`

Development agents: `specs/architecture/Supercore Commerce OS — Development Agent Architecture v1.0.md` (Cursor main, Lovable UI, Aider patches).

```
Phase 0 Foundation
  → Phase 1 Platform Core (draft — §17 closed; approve before coding)
  → Phase 2 Supercore Commerce Engine
  → Phase 3 Supercore B2B + CRM
  → Phase 4 ERP / Inventory / Procurement foundations
  → Phase 5 Supercore Accounting Engine
  → Phase 6 Supercore Tax / VAT
  → Phase 7 Supercore AI
```

See ADRs in `specs/architecture/adr/`.
