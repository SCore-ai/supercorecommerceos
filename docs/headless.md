# Headless runtimes

Vendure and Frappe are **not** started from this repository. Install and run them with their own docs.

## Vendure

1. Create a Vendure project (`npx @vendure/create`).
2. Copy `integrations/vendure-plugin/order-webhook-plugin.ts` into that project.
3. `SupercoreOrderWebhookPlugin.init({ bridgeUrl: 'http://127.0.0.1:4010', secret: process.env.VENDURE_WEBHOOK_SECRET })`.

Event: `OrderStateTransitionEvent` — `references/vendure/packages/core/src/event-bus/events/order-state-transition-event.ts`.

The bridge ignores every `toState` except `PaymentSettled`.

## Frappe

Use a Frappe site with ERPNext (Sales Invoice, Customer, Item). SKUs on Vendure variants must exist as Item `item_code` in Frappe. The bridge does not create Items and does not compute VAT.

REST: `POST /api/resource/Sales Invoice` with token `api_key:api_secret`.

## Bridge

```bash
pnpm --filter @supercore/bridge dev
```

`GET /health` · `POST /webhooks/vendure/order`
