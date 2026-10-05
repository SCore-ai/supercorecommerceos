# SUPERCORE COMMERCE OS

## Phase 5 — Supercore Accounting Engine Specification v1.0

**Document type:** Phase charter  
**Status:** Draft direction — chart of accounts and VAT codes not invented here  
**Depends on:** Phase 1; typically Phase 2 orders and Phase 4 receipts as source documents  
**Date:** 2026-09-17

---

# 1. Purpose

Phase 5 builds the **canonical Supercore Accounting Engine**.

```
Supercore Accounting Engine
        │
        ├── Chart of Accounts
        ├── Journal
        ├── GL
        ├── AR
        ├── AP
        ├── Invoice
        └── Payment
```

ERPNext is **not** installed and **not** required.
There is no ERPNext implementation phase.

---

# 2. Canonical owner

`@supercore/accounting` owns the ledger.

```
AccountingProvider
        ├── SupercoreAccountingProvider   (canonical)
        └── ERPNextAccountingProvider     (optional, unscheduled)
```

Do not implement ERPNext in this phase.

Canonical accounting still posts to Supercore GL. An optional adapter would only translate, never own.

---

# 3. Hard rules already decided

From AGENTS.md and ADR-007:

- No JavaScript `number` for amounts
- `numeric` + `decimal.js` + explicit currency
- Posted transactions are immutable
- Entries must balance
- Never delete financial records
- Audit every financial change

---

# 4. Payments in this phase

Customer/supplier **payment allocation** is an accounting document.

Card/processor capture remains behind `PaymentProvider` (typically used from Phase 2).
Processor IDs are external references, never primary keys.

There is no dedicated Payments phase.

---

# 5. Out of scope until addendum

- Concrete chart of accounts
- VAT codes (Phase 6 owns tax determination; this phase stores money)
- FX revaluation method
- Period close procedure
- Revenue recognition

---

# 6. Definition of done (after addendum)

- Posted journals cannot be edited in place
- Debits equal credits
- No ERPNext runtime
- Tenant isolation holds

---

# 7. Development agents and UI

Canonical: `specs/architecture/Supercore Commerce OS — Development Agent Architecture v1.0.md`.

## 7.1 Lovable (this phase)

Accounting screens: chart of accounts, journal, GL, AR, AP, invoice, payment allocation.

Shared: admin dashboard tiles (display only), tables, filters, forms, navigation, responsive layout.

Amounts on screen are strings such as `"12.50 GBP"`. The UI must not balance journals or compute tax.

## 7.2 Cursor

`@supercore/accounting` double-entry services, immutability, audit, APIs, port UI, tests. Posted documents cannot be edited in the client.

## 7.3 Aider

Optional small patch. No chart-of-accounts invention.

---

# 8. Reference lookup

Primary comparison trees: `references/erpnext/` (accounts) and `references/frappe/`.

Their chart of accounts is not ours. Canonical: `specs/architecture/Supercore Commerce OS — External Reference Clones v1.0.md`.

