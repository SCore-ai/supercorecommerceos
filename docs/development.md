# Development

AI tool roles (Cursor / Lovable / Aider): `docs/tooling.md`. Runtime ownership: **ADR-010**.

## Prerequisites

- Node.js 24 LTS
- pnpm 11
- Separate Vendure and Frappe/ERPNext runtimes (not started from this repo)

Copy `.env.example` to `.env`. Do not commit `.env`.

## Run the bridge

```bash
pnpm install
pnpm --filter @supercore/bridge dev
```

`GET http://127.0.0.1:4010/health`  
`POST http://127.0.0.1:4010/webhooks/vendure/order`

Point the Vendure plugin (`integrations/vendure-plugin/order-webhook-plugin.ts`) at that URL. Details: `docs/headless.md`.

## Quality

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
