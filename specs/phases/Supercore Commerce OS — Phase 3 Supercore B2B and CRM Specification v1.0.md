# SUPERCORE COMMERCE OS

## Phase 3 — Supercore B2B and CRM Specification v1.0

**Document type:** Phase charter  
**Status:** Charter — first decisions approved 2026-10-05 in Phase 3 Addendum First Decisions v1.0. First slice is in `@supercore/crm` and `@supercore/b2b`.  
**Depends on:** Phase 1; catalog/order from Phase 2 where quotes convert  
**Date:** 2026-09-17  
**Addendum approved:** 2026-10-05

---

# 1. Purpose

Phase 3 builds **Supercore CRM** and **B2B commerce behaviour** as first-party domains.

Frappe CRM is **not** installed and **not** required.
There is no Frappe implementation phase.

```
Supercore CRM
        ├── Lead
        ├── Account / Company
        ├── Contact
        ├── Opportunity
        ├── Activity / Task
        ├── Quote
        └── Pipeline

Supercore B2B
        ├── Company buyer
        ├── Contract / agreement structure
        └── Account-linked catalog access
```

---

# 2. Canonical owner

- `@supercore/crm` — CRM
- `@supercore/b2b` — B2B rules

```
CRMProvider
        ├── SupercoreCRMProvider          (canonical)
        └── FrappeCRMProvider             (optional, unscheduled)
```

Do not implement Frappe unless a later spec asks for it.

A CRM Account links to a Phase 1 Customer only when `customerId` is set. That rule is closed in Phase 3 Addendum First Decisions v1.0 §2.1. Do not invent another match.

Quotes that convert to orders use Phase 2 commerce. CRM does not become a second order engine.

---

# 3. In scope (after addendum)

- Lead, account, contact, opportunity, activity, quote, pipeline records
- Tenant-isolated CRM API and admin screens
- B2B company user membership (building on Phase 1 users/organisations)
- Account-linked catalog access **structure** (rules in addendum)

---

# 4. Closed by addendum, and still out of scope

Closed in Phase 3 Addendum First Decisions v1.0 (do not reopen in code):

- Account is the same party as a Customer only via explicit `customerId`
- Pipeline stage names, outcomes, and the Frappe probability percents (10, 25, 50, 70, 90, 100, 0)
- No lead scoring
- No quantity-break formulas; catalog access is an allow-list of Phase 2 products
- Credit limit uses the ERPNext outstanding formula (GL + unbilled order + unbilled delivery)
- Quote tax rows use the ERPNext charge types; conversion calls Phase 2 `addCartLine` and `placeOrderRecord`
- B2B buyer is a Phase 1 User membership on the Account

Still out of scope:

- Punchout / EDI
- Marketing automation
- HubSpot / Salesforce / Frappe as system of record

---

# 5. Definition of done (after addendum)

- CRM records persist under tenant isolation
- A B2B buyer can be permissioned as a company user
- No Frappe/HubSpot/Salesforce ownership of data

---

# 6. Development agents and UI

Canonical: `specs/architecture/Supercore Commerce OS — Development Agent Architecture v1.0.md`.

## 6.1 Lovable (this phase)

CRM screens: lead, account/company, contact, opportunity, activity/task, quote, pipeline.

B2B portal: company-buyer shell, account-linked catalog **layout**, contract/agreement **structure** screens.

Shared: dashboard widgets that only display API data, tables, filters, forms, navigation, responsive layout.

Do not invent pipeline probabilities, lead scores, or quantity-break formulas.

## 6.2 Cursor

`@supercore/crm` and `@supercore/b2b` services, APIs, RBAC permissions for CRM/B2B, port UI, tests. Quote conversion calls Phase 2 order services — not a second order engine in the browser.

## 6.3 Aider

Optional small patch. No CRM product rules.

---

# 7. Reference lookup

Primary comparison tree: `references/frappe-crm/` (framework: `references/frappe/`). ERPNext and Vendure were also read for customer, quotation, credit, and portal shape.

Use them for shape. Frappe is not the system of record. The approved decisions and the rejected clone rules are in Phase 3 Addendum First Decisions v1.0. Canonical: `specs/architecture/Supercore Commerce OS — External Reference Clones v1.0.md`.

