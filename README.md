# SUPERCORE COMMERCE OS

Modular monolith foundation for Supercore's long-lived Commerce OS.

Phase 0 is platform bootstrap. Phase 1 adds first-party auth, tenants, organisations, users, customers, suppliers, addresses, countries, currencies, and audit.

Optional local Super Admin (never commit a real password):

```
BOOTSTRAP_SUPERADMIN_EMAIL=you@localhost
BOOTSTRAP_SUPERADMIN_PASSWORD=choose-a-long-password
```

Then `pnpm db:migrate` and `pnpm --filter @supercore/api dev`. The API creates the Super Admin on startup if those env vars are set and no platform user exists yet.

This is a greenfield repository. There is no migration from Shopify, Vendure, Saleor, ERPNext, Frappe CRM, or any other external platform.

Those systems remain optional replaceable adapters only. They are not installed in Phase 0–1 and have no dedicated phase. Supercore owns Commerce, CRM, Accounting, and Tax engines.

Phase sequence: 0 Foundation → 1 Platform Core → 2 Commerce → 3 B2B+CRM → 4 ERP foundations → 5 Accounting → 6 Tax/VAT → 7 AI.

Canonical documents: `specs/phases/` and `specs/architecture/`.

## Requirements

- Node.js 24.x LTS (`24.19.0` pinned in `.nvmrc`)
- pnpm 11.x (`packageManager` is `pnpm@11.20.0`)
- Docker Desktop (PostgreSQL and Redis)

## Quick start

```bash
cp .env.example .env
pnpm install
docker compose up -d
pnpm db:migrate
pnpm dev
```

Apps:

- API: http://127.0.0.1:4000/health
- GraphQL: http://127.0.0.1:4000/graphql
- Web: http://127.0.0.1:3000
- Admin: http://127.0.0.1:3001
- PostgreSQL: `127.0.0.1:5433`
- Redis: `127.0.0.1:6380`

Worker: `pnpm worker`

## Commands

| Command | Purpose |
|---|---|
| `pnpm install` | Install workspace dependencies |
| `pnpm dev` | Run API, web, admin, and worker |
| `pnpm build` | Typecheck packages and build apps |
| `pnpm test` | Unit tests |
| `pnpm test:e2e` | Playwright foundation |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript across the workspace |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Apply Drizzle migrations |
| `pnpm db:studio` | Drizzle Studio |
| `pnpm worker` | Start the BullMQ worker |
| `pnpm security:audit` | Production dependency audit |

## Architecture

Human requirement → Specification → Domain → Application → API → Infrastructure → Database.

External systems, if used later, are adapters only. They are never the canonical data owner.

See `docs/architecture.md` and `specs/architecture/adr/`.
