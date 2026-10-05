# Architecture

**ADR-010** is the active runtime decision.

```
Storefront (later) → Vendure Shop GraphQL
Vendure (commerce SoR) → HTTP webhook PaymentSettled
@supercore/bridge → Frappe REST
Frappe / ERPNext (ERP SoR)
```

This repository is the webhook bridge only. It is not a second commerce engine and not a second ERP.

- `services/bridge` — HMAC verify, map order, POST Customer + Sales Invoice
- `integrations/vendure-plugin` — drop-in for a separate Vendure process
- Comparison clones: `references/` (gitignored). Do not import them.

Shopify is out of scope.

Historical P0–P7 engine charters remain under `specs/phases/` and do not override ADR-010.

Development agents: Cursor (bridge), Lovable (storefront prototype), Aider (small patches).
