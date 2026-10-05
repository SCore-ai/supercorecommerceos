# SUPERCORE COMMERCE OS

## Phase 2 — Supercore Commerce Engine Specification v1.0

**Document type:** Phase charter  
**Status:** First slice addendum closed 2026-10-05 — see Phase 2 Addendum First Slice v1.0  
**Depends on:** Phase 1 Platform Core  
**Date:** 2026-09-17

---

# 1. Purpose

Phase 2 builds the **canonical Supercore Commerce Engine**.

```
Supercore Commerce Engine
        │
        ├── Supercore DB
        ├── Supercore API
        ├── Supercore Pricing
        ├── Supercore Catalog
        ├── Supercore Order
        └── Supercore Inventory (commerce-facing availability)
```

Vendure is **not** installed and **not** required.
There is no Vendure implementation phase.

Payment **capture** belongs with orders in this phase (via `PaymentProvider`).
There is no dedicated Payments phase.
AR/AP payment documents belong to Phase 5 Accounting.

---

# 2. Canonical owner

`@supercore/commerce` owns product, catalog, pricing records, cart, checkout, and order.

`CommerceProvider` stays the adapter boundary:

```
CommerceProvider
        ├── SupercoreCommerceProvider     (canonical — this phase)
        └── VendureCommerceProvider       (optional, unscheduled)
```

Do not implement `VendureCommerceProvider` unless a later approved spec asks for it.

Canonical implementations still write to Supercore DB. The provider name does not move ownership to an external engine.

---

# 3. In scope (after addendum)

- Product / variant / catalog
- Price storage using ADR-007 (`numeric` + currency code)
- Cart and checkout
- Order / order line
- Commerce-facing inventory (sellable quantity)
- Payment capture via `PaymentProvider` (processor is replaceable; order is canonical)
- Refund **structure** tied to the order (processor refund still through the adapter)
- Shipment and return **structure**
- `ShippingProvider` remains an interface until a carrier is chosen

---

# 4. Payments (this phase, not a separate phase)

```
Order
    ↓
packages/payments (records) + PaymentProvider (processor)
    ↓
External processor (optional)
```

Hard rules already decided:

- Processor charge IDs are `ExternalReference` only, never primary keys
- Never log PAN, CVV, or full account numbers
- Never store raw card data in PostgreSQL
- Webhooks use the Phase 0 `WebhookVerifier`
- Failed payments do not delete orders
- Choice of live processor is an addendum item; default first slice is a stub

---

# 5. Out of scope

- Vendure, Saleor, Shopify
- Historical order import
- Full warehouse WMS (Phase 4)
- Accounting journals (Phase 5)
- VAT rates (Phase 6)
- Invented discount stacking, tax-inclusive rules, or guest-checkout policy until addendum

---

# 6. Required addendum before coding

1. Price tax-inclusive or exclusive
2. Cart expiry
3. Checkout identity (authenticated only vs guest)
4. Order statuses
5. When stock is checked
6. Which `PaymentProvider` (if any) is used in the first slice — default is a stub that does not call a live gateway

---

# 7. Definition of done (after addendum)

- Supercore DB is the order system of record
- Tenant isolation holds
- No Vendure runtime
- Tests cover catalog + order happy path
- Payment records exist independently of any processor

---

# 8. Development agents and UI

Canonical: `specs/architecture/Supercore Commerce OS — Development Agent Architecture v1.0.md`.

```
Requirement → Spec addendum → Lovable prototype → Cursor production code
```

## 8.1 Lovable (this phase)

Product screens, catalog, order list/detail, cart/checkout **layout**, commerce availability.

Shared: admin/web navigation, tables, filters, forms, responsive layout, visual hierarchy, empty/error states.

Do not invent discount stacking, tax-inclusive math, or live payment forms that take PAN/CVV.

## 8.2 Cursor

`@supercore/commerce` domain, application services, GraphQL/REST, PaymentProvider stub, Playwright, port UI into `apps/admin` / `apps/web`. Totals and stock checks live on the API.

## 8.3 Aider

Optional named refactor after Cursor lands the slice. No new commerce rules.

---

# 9. Reference lookup

Primary comparison tree: `references/vendure/`.

Use it to inspect catalog/order/plugin **shape**. Do not take Vendure IDs, tax mode, or checkout math. Canonical: `specs/architecture/Supercore Commerce OS — External Reference Clones v1.0.md`.

