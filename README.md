# SUPERCORE COMMERCE OS

Modular monolith foundation for Supercore's long-lived Commerce OS.

Phase 0 is platform bootstrap only. It does not implement commerce, CRM, accounting, tax, inventory, payments, or AI agents.

This is a greenfield repository. There is no migration from Shopify, Vendure, Saleor, ERPNext, Frappe CRM, or any other external platform.

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
