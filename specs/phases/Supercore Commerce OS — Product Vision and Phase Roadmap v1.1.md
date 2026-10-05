# SUPERCORE COMMERCE OS

## Product Vision and Phase Roadmap v1.1

**Document type:** Product and architecture roadmap  
**Status:** Active — supersedes v1.0 phase numbering  
**Owner:** Supercore  
**Primary implementation tool:** Cursor  
**UI/UX prototyping:** Lovable  
**Controlled patches:** Aider  
**Date:** 2026-09-17

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

Local comparison trees (gitignored clones, not runtimes):

| Lookup | Path |
|---|---|
| Commerce patterns | `references/vendure/` |
| CRM patterns | `references/frappe-crm/` |
| Accounting / stock / buying | `references/erpnext/` |
| Frappe framework | `references/frappe/` |

Binding usage: `specs/architecture/Supercore Commerce OS — External Reference Clones v1.0.md`.  
Spec and ADR always beat a pattern found in those trees.

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

Phase 0 foundation is in the repository (see Phase 0 Completion Audit). Local checks were reported during implementation. Remote CI did not run on `7de6c75` because `.github/workflows/ci.yml` triggered on `main` while the default branch is `master`. The close-out points that trigger at `master`. Phase 0 objective 22 stays open until an Actions run URL is bound to the close-out commit.

Phase 1 Platform Core is implemented on `master` at `7de6c75` (2026-10-05, full SHA `7de6c75c9bcd1dbe70b725d18b8088580c5497ea`). That commit has first-party auth, session-derived tenant isolation, RBAC, customer and supplier master data, addresses, country and currency seed, and same-transaction audit. **§17 blockers are closed** (same day; ADR-006 amendment, ADR-009). **§15 Definition of Done is aligned to that commit.** Phase 2 code has not started.

Phases 2–7 are direction charters. Detailed pricing, VAT rates, ledger charts, and checkout rules are **not invented** here. Each phase needs an approved addendum before those rules are coded.

---

# 6. What each phase produces

## Phase 0 — Foundation

Platform bootstrap: monorepo, API, web, admin, Postgres, Redis, worker, tests, CI workflow, adapter interfaces.

Local implementation is reported in the Completion Audit. Bind logs and a remote CI run to a commit before calling the phase independently verified.

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

During implementation, Cursor may look up `references/` as in External Reference Clones v1.0. That lookup does not install those products and does not replace this roadmap.

---

# 9. Approval

Phase 1 coding starts only after the Phase 1 Platform Core Specification is **explicitly approved**. §17 blockers in that spec are closed (2026-10-05).

Later phases start only after their specification (and any required addendum) is approved.
