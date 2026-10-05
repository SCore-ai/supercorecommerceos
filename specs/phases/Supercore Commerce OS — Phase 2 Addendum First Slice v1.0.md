# SUPERCORE COMMERCE OS

## Phase 2 — Addendum First Slice v1.0

**Document type:** Approved-required addendum to the Phase 2 charter  
**Status:** First slice closed 2026-10-05 (product request to implement P2)  
**Depends on:** Phase 1 Platform Core (`7de6c75`); Phase 2 charter v1.0 §6  
**Does not include:** VAT rates, WMS, guest identity, live card capture, discount stacking, Vendure runtime

---

# 1. Why this file exists

The Phase 2 charter forbids coding until these six items are written. This addendum closes them for **the first slice only**. Changing any item needs a new addendum.

Lookup attempted: `references/vendure/` is not cloned in this workspace (only `references/README.md`). Binding map: `specs/architecture/Supercore Commerce OS — External Reference Clones v1.0.md`. Do not take Vendure IDs, tax mode, or checkout math.

---

# 2. Closed §6 items

## 2.1 Price tax-inclusive or exclusive

**Exclusive (net).** Store `numeric(19, 4)` plus ISO-4217 `currencyCode` (ADR-007). GraphQL money is a decimal **string**. JavaScript `number` is rejected.

Phase 2 does **not** compute VAT. Phase 6 owns tax determination. Line total = `quantity × unitPrice` using `decimal.js` (half-even at serialize time, ADR-007). No tax-inclusive flag on the price row.

Contrast (not copied): Vendure tax mode is forbidden as our rule.

## 2.2 Cart expiry

**12 hours after the last cart mutation**, using the same duration as Phase 1 session TTL (`SESSION_TTL_SECONDS`). This is not a second invented clock; it reuses the already closed session length.

- Status: `open` → `expired` when read/checkout sees `expiresAt` in the past.
- Expired carts cannot checkout.
- A new `open` cart is created on the next add-to-cart.
- Converted carts are `converted` and are not reused.

## 2.3 Checkout identity

**Authenticated tenant user only.** Super Admin (null `tenantId`) cannot own a cart or place an order.

Phase 1 has no guest principal. Guest checkout is out of this slice (charter §5).

Cart owner is `(tenantId, userId)` from the session. `customerId` on the order is a Phase 1 customer in the same tenant (required at place-order).

## 2.4 Order statuses

First slice only:

| Status | Meaning |
|---|---|
| `placed` | Created at checkout; stock decremented |
| `cancelled` | From `placed` only; stock restored; row is not deleted |

Cart is the draft. There is no `draft` order. No fulfillment / shipped / returned states (Phase 4). Refund **records** are not in this slice; cancelling does not invent a refund document.

## 2.5 When stock is checked

Commerce-facing `sellableQuantity` lives on the variant in `@supercore/commerce`. It is **not** warehouse truth (Phase 4).

- Add-to-cart does **not** reserve stock.
- At **place-order**, in one transaction: check `sellableQuantity >= line quantity` for every line, then decrement.
- Insufficient stock → `ConflictError`. Order is not created.
- Cancel restores the decremented quantity.

## 2.6 PaymentProvider for the first slice

**Stub only.** `StubPaymentProvider`. No live gateway. No PAN/CVV fields. No raw card data.

On successful place-order, insert `commerce_payments` in the **same transaction** as the order:

- `provider` = `stub`
- `status` = `captured`
- `externalReference` = opaque stub id (`ExternalReference`, never the row PK)

Failed capture does not delete orders. This slice does not expose a fail-capture API; the happy path captures in-transaction so a failed stub cannot leave a placed order without a payment row.

---

# 3. First-slice model

Canonical owner: `@supercore/commerce`. Tables live in the single `@supercore/core` Drizzle tree (ADR-009).

- Product + variant + one list price per `(variant, currency)`
- Cart + cart line
- Order + order line (price/sku/name snapshotted)
- Payment record (stub)

Out of this slice (still in the charter for a later Phase 2 addendum): shipment UI, return UI, refund documents, multi-currency catalogs per customer, discount stacking.

RBAC (new permissions; existing roles):

| Permission | tenant_admin | manager | sales | finance | warehouse | procurement | support | viewer |
|---|---|---|---|---|---|---|---|---|
| `catalog.read` | yes | yes | yes | yes | yes | yes | yes | yes |
| `catalog.write` | yes | yes | no | no | no | no | no | no |
| `cart.write` | yes | yes | yes | no | no | no | no | no |
| `order.read` | yes | yes | yes | yes | yes | no | yes | yes |
| `order.write` | yes | yes | yes | no | no | no | no | no |

`tenant_admin` continues to receive every tenant permission in `PERMISSION_NAMES`.

---

# 4. UI

Admin: catalog (product list/detail, variants, net price as `"12.5000 GBP"`), orders (list/detail, cancel).

Web: signed-in catalog, cart, checkout layout, own orders. Totals come from the API. No tax math and no card fields in the browser.
