# SUPERCORE COMMERCE OS

## Product Vision and Phase Roadmap v1.1

**Document type:** Product and architecture roadmap  
**Status:** Active — supersedes v1.0 phase numbering  
**Owner:** Supercore  
**Primary implementation tool:** Cursor  
**UI/UX prototyping:** Lovable  
**Controlled patches:** Aider  
**Date:** 2026-09-17  
**Reference clones protocol:** 2026-10-05 (§2.1 — trees stay in `references/`; query on prompt)

---

# 1. What we are building

Supercore Commerce OS is Supercore’s own Commerce OS / Business OS.

It is greenfield. There is no Shopify, Vendure, ERPNext, or Frappe migration.

Supercore owns the canonical engines:

- Supercore Commerce Engine
- Supercore CRM
- Supercore Accounting Engine
- Supercore Tax Engine

External systems such as Vendure, ERPNext, Frappe CRM, HMRC, payment providers, shipping providers and supplier APIs **must remain replaceable integrations**.

They are not the system of record.
They are not scheduled implementations.
They are not separate phases.

---

# 2. Binding engine strategy

| System | When | Role |
|---|---|---|
| Vendure | **Not installed in Phase 0–1.** No dedicated phase. | Optional future reference / comparison / temporary `CommerceProvider` if a later spec justifies it |
| ERPNext | **Not installed in Phase 0–1.** No dedicated phase. | Optional future reference / temporary `AccountingProvider` if a later spec justifies it |
| Frappe CRM | **Not installed in Phase 0–1.** No dedicated phase. | Optional future `CRMProvider` if a later spec justifies it |
| Supercore Commerce Engine | Phase 2 | Canonical commerce |
| Supercore CRM (with B2B) | Phase 3 | Canonical CRM + B2B |
| Supercore ERP foundations | Phase 4 | Inventory + procurement foundations |
| Supercore Accounting Engine | Phase 5 | Canonical accounting |
| Supercore Tax Engine | Phase 6 | Canonical tax / VAT |
| Supercore AI | Phase 7 | Assistive AI; cannot bypass domain rules |

We will not add Vendure or ERPNext merely because they exist.

## 2.1 Reference architecture clones (stay in the project)

Vendure, ERPNext, Frappe CRM, and the Frappe framework **remain in this project folder** as read-only reference architecture and code. They stay under `references/`. They are not deleted when a phase closes. They are not installed runtimes. They are not numbered phases.

| Lookup | Path | Stays in the repo as |
|---|---|---|
| Commerce patterns | `references/vendure/` | Reference architecture / code |
| CRM patterns | `references/frappe-crm/` | Reference architecture / code |
| Accounting / stock / buying | `references/erpnext/` | Reference architecture / code |
| Frappe framework | `references/frappe/` | Reference architecture / code |

When a human issues a prompt that needs spec approval, modelling, information, or coding, Cursor **must query those trees** for the relevant slice, cite the path used, and may take details that help the work. That lookup does not install those products.

Hard limits (unchanged):

- Specs and ADRs beat a pattern found in a clone.
- Do not copy clone business rules into Supercore unless an approved spec or ADR already allows that rule.
- Do not `import` `references/` into `apps/` or `@supercore/*`.
- Do not copy their SQL, GraphQL schema, or Python DocTypes into production.
- Optional adapters stay unscheduled.

Binding usage: `specs/architecture/Supercore Commerce OS — External Reference Clones v1.0.md`.

If a later phase needs a temporary or comparative external engine, it is evaluated as an adapter only:

```
CommerceProvider
        ├── SupercoreCommerceProvider     (canonical)
        └── VendureCommerceProvider       (optional, unscheduled)

CRMProvider
        ├── SupercoreCRMProvider          (canonical)
        └── FrappeCRMProvider             (optional, unscheduled)

AccountingProvider
        ├── SupercoreAccountingProvider   (canonical)
        └── ERPNextAccountingProvider     (optional, unscheduled)
```

This guarantees Supercore remains the owner. It does not create a dependency.

---

# 3. Phase sequence (authoritative)

```
Phase 0  Foundation                 COMPLETE
Phase 1  Platform Core
Phase 2  Supercore Commerce
Phase 3  Supercore B2B + CRM
Phase 4  ERP / Inventory / Procurement foundations
Phase 5  Supercore Accounting
Phase 6  Supercore Tax / VAT
Phase 7  Supercore AI
```

There is no Phase “Vendure”.
There is no Phase “ERPNext”.
The previous 11-phase numbering is retired.

---

# 4. Architecture

```
Requirement → Spec → Domain → Application → API → Infrastructure → Database

Supercore Domain → Adapter Interface → External Provider (optional)
```

Modular monolith.

Development agents (not a phase):

```
                    SUPERCORE DEVELOPMENT
                           │
          ┌────────────────┼────────────────┐
          │                │                │
       CURSOR           LOVABLE           AIDER
      MAIN DEV         UI/UX DEV      CONTROLLED PATCH
          │                │                │
          └────────────────┼────────────────┘
                           │
                        Git / CI
```

```
Requirement → Spec → Lovable → UI/UX prototype → Next.js / Tailwind / shadcn
        → Cursor → production code
```

Cursor is the primary engineer. Lovable is UI/UX prototyping only (no business logic). Aider is controlled refactors. Codex is not used.

Canonical: `specs/architecture/Supercore Commerce OS — Development Agent Architecture v1.0.md`.

---

# 5. Current position

Phase 0 foundation is in the repository (see Phase 0 Completion Audit). Local checks were reported during implementation. Remote CI did not run on `7de6c75` because `.github/workflows/ci.yml` triggered on `main` while the default branch is `master`. The close-out points that trigger at `master`. [Actions run 37339984665](https://github.com/SCore-ai/supercorecommerceos/actions/runs/37339984665) succeeded for `a0d709f`.

Phase 1 Platform Core is implemented on `master` at `7de6c75` (2026-10-05, full SHA `7de6c75c9bcd1dbe70b725d18b8088580c5497ea`). That commit has first-party auth, session-derived tenant isolation, RBAC, customer and supplier master data, addresses, country and currency seed, and same-transaction audit. **§17 blockers are closed** (same day; ADR-006 amendment, ADR-009). **§15 Definition of Done is aligned to that commit** (recorded in `a0d709f`). Product close-out approved 2026-10-05.

Phase 2 first-slice addendum is closed (2026-10-05). Catalog, cart, authenticated checkout, orders, sellable quantity, and stub capture are in this repository. Later Phase 2 slices (shipment/return/refund documents, discounts) still need their own addendum. Phase 3 first decisions are approved in Phase 3 Addendum First Decisions v1.0 (2026-10-05). The first slice copies deal probabilities, sales-tax rows, and the credit formula into `@supercore/crm` and `@supercore/b2b`. Phases 4–7 remain direction charters.

---

# 6. What each phase produces

## Phase 0 — Foundation

Platform bootstrap: monorepo, API, web, admin, Postgres, Redis, worker, tests, CI workflow, adapter interfaces.

Local implementation is reported in the Completion Audit. Remote CI is bound to `a0d709f` (Actions run 37339984665).

## Phase 1 — Platform Core

Tenant, Organization, User, Role, Permission, Customer, Supplier, Address, Country, Currency, Audit.
First-party auth. No Vendure/ERPNext/Frappe install.

## Phase 2 — Supercore Commerce

Canonical commerce engine:

```
Supercore Commerce Engine
        ├── Supercore DB
        ├── Supercore API
        ├── Supercore Pricing
        ├── Supercore Catalog
        ├── Supercore Order
        └── Supercore Inventory (commerce-facing)
```

Vendure is not required.

Payment **capture** uses `PaymentProvider` (replaceable). Canonical order remains Supercore.

## Phase 3 — Supercore B2B + CRM

Canonical CRM plus B2B account/buyer behaviour.
Frappe CRM is not required.

## Phase 4 — ERP / Inventory / Procurement foundations

Warehouse, stock movements, purchase orders, receipts.
This is Supercore ERP foundation, not ERPNext.

## Phase 5 — Supercore Accounting

```
Supercore Accounting Engine
        ├── Chart of Accounts
        ├── Journal
        ├── GL
        ├── AR
        ├── AP
        ├── Invoice
        └── Payment
```

ERPNext is not required.

## Phase 6 — Supercore Tax / VAT

Supercore tax engine, VAT return document, HMRC only via adapter + approval gate.

## Phase 7 — Supercore AI

Assistive agents over existing application services. Cannot bypass RBAC, ledger immutability, or HMRC approval.

---

# 7. Cross-cutting (not a numbered phase)

These are **not** extra numbered phases. They do not restore Vendure/ERPNext as engines.

| Capability | When | Owner |
|---|---|---|
| Payment **capture** (processor) | Phase 2 with orders | `PaymentProvider`; processor IDs are external |
| Payment **allocation** (AR/AP) | Phase 5 | `@supercore/accounting` |
| Shipping rates/labels | When a carrier is chosen | `ShippingProvider` |
| Search | When a domain needs it | `SearchProvider` (`@supercore/search`) |
| Files | When a domain needs it | `FileStorageProvider` (`@supercore/files`) |
| Reporting / workflow / backups / NGINX TLS | When operations require them | Platform; see Cross-cutting spec |

See `specs/architecture/Supercore Commerce OS — Cross-cutting Platform Services Specification v1.0.md`.

---

# 8. Development agents (applies to every phase)

Cursor, Lovable, and Aider are how we **build** Phases 1–7. They are not extra product engines and not Phase 8.

Lovable: dashboard, CRM, customer, product, order, accounting, B2B portal, admin panel, tables, filters, forms, navigation, responsive layout, visual hierarchy, UX flows.

Cursor: production architecture, APIs, tests, and porting that UI into `apps/web` / `apps/admin`.

Details: `specs/architecture/Supercore Commerce OS — Development Agent Architecture v1.0.md`.

During spec work, approvals, and implementation prompts, Cursor **queries** `references/vendure`, `references/erpnext`, `references/frappe-crm`, and `references/frappe` when the task needs comparison architecture or code. Cite paths. Take details that help. Do not treat those trees as engines, and do not replace this roadmap. See §2.1.

---

# 9. Approval

Phase 1 Platform Core was **explicitly approved** and is implemented on `master` at `7de6c75` (2026-10-05). §17 blockers are closed. §15 is aligned to that commit. Remote CI succeeded for `a0d709f` ([Actions run 37339984665](https://github.com/SCore-ai/supercorecommerceos/actions/runs/37339984665)). Phase 2 first-slice addendum is closed (2026-10-05); later Phase 2 slices still need their own addendum.

Later phases start only after their specification (and any required addendum) is approved.
