# Development

AI tool roles (Cursor / Lovable / Aider): `docs/tooling.md` and `specs/architecture/Supercore Commerce OS — Development Agent Architecture v1.0.md`.

## Prerequisites

- Node.js 24 LTS
- pnpm 11
- Docker Desktop

Copy `.env.example` to `.env`. Do not commit `.env`. Local Docker maps PostgreSQL to `5433` and Redis to `6380`.

Optional Phase 1 Super Admin bootstrap (development only): set `BOOTSTRAP_SUPERADMIN_EMAIL` and `BOOTSTRAP_SUPERADMIN_PASSWORD` (min 12 characters). The API creates that platform user on startup if it does not exist.

## Local infrastructure

```bash
docker compose up -d
pnpm db:migrate
```

PostgreSQL: `127.0.0.1:5433`
Redis: `127.0.0.1:6380`

Host ports 5433 and 6380 are used so this stack does not collide with other local databases on 5432/6379.

Applications run on the host, not inside Docker, during Phase 0 development.

## Run

```bash
pnpm install
pnpm dev
```

Individual processes:

```bash
pnpm --filter @supercore/api dev
pnpm --filter @supercore/web dev
pnpm --filter @supercore/admin dev
pnpm worker
```

## Quality

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Integration tests (requires Docker):

```bash
$env:RUN_INTEGRATION='1'
pnpm test
```

Playwright:

```bash
pnpm test:e2e
```
