# SUPERCORE COMMERCE OS

## External Reference Clones v1.0

**Document type:** Development lookup map (not a numbered phase)  
**Status:** Active  
**Date:** 2026-09-17

Local clones live in `references/`. They are **comparison trees**. They are not runtimes, not phases, and not the system of record.

How we build:

```
specs/  (canonical rules)
    ↓
apps/ + packages/  (canonical code)
    ↓
references/  (optional look-up: how another product modelled a similar problem)
```

A pattern seen in Vendure, ERPNext, or Frappe CRM may inform a design conversation. It does **not** become a Supercore business rule until it is written into an approved phase spec or ADR.

---

# 1. Trees

| Path | Upstream | Typical lookup |
|---|---|---|
| `references/vendure/` | https://github.com/vendure-ecommerce/vendure | Catalog, variant, order, payment plugin, GraphQL admin |
| `references/erpnext/` | https://github.com/frappe/erpnext | Chart of accounts, journal, stock, purchase order, invoice |
| `references/frappe-crm/` | https://github.com/frappe/crm | Lead, organization, deal, activity |
| `references/frappe/` | https://github.com/frappe/frappe | DocType, permissions, desk — framework only |

Clone recreation and ignore rules: `references/README.md`.

---

# 2. Per-phase lookup

| Phase | Primary lookup | Do not take from the clone |
|---|---|---|
| 0 Foundation | None required | Their Docker/bench as our runtime |
| 1 Platform Core | First-party auth. Comparison only: Vendure user/session/address, Frappe User, ERPNext Company. Cite paths when used. | Their user/tenant/company models as ours; global email uniqueness; bcrypt as our hasher |
| 2 Commerce | `references/vendure/` | Their IDs, checkout math, tax mode |
| 3 B2B + CRM | `references/frappe-crm/` | Their pipeline probabilities, Frappe as SoR |
| 4 Inventory / procurement | `references/erpnext/` (stock, buying) | ATP, MRP, running ERPNext |
| 5 Accounting | `references/erpnext/` (accounts) + `references/frappe/` | Their CoA as our CoA |
| 6 Tax / VAT | `references/erpnext/` tax/VAT modules only as comparison | HMRC filing, rates |
| 7 AI | None of these three as product AI | Autonomous posting |

---

# 3. Rules for Cursor (and any agent)

1. Read the **phase spec** first.
2. You may search `references/` when the human asks, or when a modelling question is underspecified **and** you then stop rather than invent. Phase 1 §17 closures and later implementation prompts should look up those trees and cite paths.
3. Quote paths under `references/` when you use them, so the choice is reviewable.
4. Do not `import` those trees into `@supercore/*`.
5. Do not copy their SQL, GraphQL schema, or Python DocTypes into production.
6. Do not install or start Vendure / bench / MariaDB for those clones unless a later spec says so.
7. Optional adapters remain unscheduled.

---

# 4. Conflict

If a clone disagrees with `specs/` or an ADR, **the spec and ADR win**.
