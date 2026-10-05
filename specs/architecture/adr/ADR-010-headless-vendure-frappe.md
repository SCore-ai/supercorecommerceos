# ADR-010 Headless Vendure + Frappe backends

## Context

ADR-002 made Supercore the canonical owner of Commerce, CRM, Accounting, and Tax engines. Phase 0–2 in this repository implemented a modular monolith (`apps/api`, `apps/web`, `apps/admin`, `@supercore/commerce`) under that rule.

On 2026-10-05 the product owner (Tolga) instructed Cursor to:

1. Delete the implemented application and package trees (including Phase 0 runtime work).
2. Stop treating Supercore as the commerce/ERP engine.
3. Run a **headless** layout: Vendure owns cart, checkout, and payment capture; Frappe owns ERP, stock, and accounting; this repository owns the **bridge** that forwards a completed Vendure order to Frappe.

This ADR records that reversal. It does not copy Vendure or Frappe source into `@supercore/*`. Those products remain separate runtimes.

## Decision

```
Storefront (later, HTTP/GraphQL client only)
        │
        ▼
Vendure  (commerce SoR: catalog, cart, payment)
        │  HTTP webhook on order state → PaymentSettled
        ▼
@supercore/bridge  (this repo)
        │  Frappe REST: Customer + Sales Invoice (order payload)
        ▼
Frappe / ERPNext  (ERP SoR: stock, ledger, invoice documents)
```

- **Vendure** is the system of record for catalog, cart, checkout, and processor capture.
- **Frappe** is the system of record for stock, accounting, and the invoice document.
- **This repository** is not a second commerce engine and not a second ERP. It verifies the webhook, maps fields, and posts to Frappe.
- Vendure order `id` / `code` and Frappe document names are **external identifiers**. If the bridge persists a row later, it stores them as `ExternalReference`, never as our primary key (ADR-003 still applies to anything we store).
- Do not import `references/vendure` or `references/frappe` into production packages. Those trees stay comparison clones.
- Tax **rates** are not invented here. Amounts on the invoice are the figures Vendure already placed on the order payload.
- Guest vs authenticated checkout, tax-inclusive pricing, and warehouse ATP remain Vendure/Frappe configuration — not reimplemented in the bridge.
- Shopify is still out of this architecture.

## Alternatives

- Keep ADR-002 and continue `@supercore/commerce`: rejected by product instruction.
- Vendor Vendure and Frappe source into this monorepo: rejected; they are runtimes, not libraries we fork.
- Bidirectional sync and stock reservation in the bridge: deferred; first slice is order-completed → Frappe invoice.

## Consequences

- ADR-002 and ADR-004 remain historical for the withdrawn modular-monolith engines. **Runtime ownership follows this ADR.**
- Phase 1–2 code in `apps/` and `packages/` is removed.
- Optional storefronts talk to **Vendure GraphQL**, not to Frappe and not to a Supercore domain API.
- A Vendure plugin (small, in this repo) POSTs `OrderStateTransitionEvent` payloads when `toState` is `PaymentSettled` (see `references/vendure/packages/core/src/event-bus/events/order-state-transition-event.ts`).
