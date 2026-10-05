# SUPERCORE COMMERCE OS

## Development Agent Architecture v1.0

**Document type:** Binding development architecture (not a numbered phase)  
**Status:** Active  
**Applies to:** Phase 0 (complete) and Phase 1–7  
**Date:** 2026-09-17

This document is the source of truth for **who writes what**.  
Phase charters must not contradict it.  
There is no Phase 8 and no “agent implementation phase”.

---

# 1. Binding split

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

| Tool | Role | Writes production code in this repo? |
|---|---|---|
| **Cursor** | Principal / staff engineer. Specs, domain, API, worker, tests, git, CI, production UI wiring. | Yes |
| **Lovable** | UI/UX designer and frontend start/prototyping. | No. Cursor ports accepted screens. |
| **Aider** | Controlled second engineer. Named, small refactor or patch. | Yes, only the files in that patch |
| **Codex** | Not used. | No |

Cursor is the only path that may merge production behaviour to `master`.

---

# 2. Frontend pipeline (mandatory)

Lovable does **not** write Supercore business logic.

```
Requirement
    ↓
Specification  (human + Cursor)
    ↓
Lovable
    ↓
UI / UX Prototype
    ↓
Component Structure
    ↓
Next.js / Tailwind / shadcn
    ↓
Cursor
    ↓
Production Code  (apps/web, apps/admin)
    ↓
Tests + Git / CI
    ↓
Aider (optional small patch)
```

Lovable sits in **PLAN (visual)** only.  
**IMPLEMENT** of production code is Cursor.

Target stack for every prototype and every production screen:

- Next.js App Router
- Tailwind CSS
- shadcn/ui
- TypeScript

Apps:

- `apps/admin` — admin panel
- `apps/web` — operator / B2B portal shell (not a public marketing site)

---

# 3. Cursor — main engineer

Cursor may:

- Read and update `/specs`
- Search `references/` for comparison and cite the path
- Implement domain, application services, API, worker, migrations
- Port accepted Lovable UI into `apps/web` and `apps/admin`
- Replace mocks with real HTTP/GraphQL calls
- Add unit, integration, and Playwright tests
- Review Aider diffs
- Run git/CI workflows (commits only when the human asks)

Cursor must not:

- Invent business rules missing from an approved spec
- Trust Lovable output as architecture
- Import or install Vendure, ERPNext, Frappe CRM, or Shopify
- Copy their schemas or DocTypes into `@supercore/*`
- Put domain formulas, tax, stock, or money math in the frontend
- Skip tests for a feature

Specialist Cursor subagents (explore, review, debug) still obey `AGENTS.md`. They are not a fourth product tool.

---

# 4. Lovable — UI/UX only

## 4.1 Job

Fast, high-quality **presentation**:

- dashboard shells
- CRM screens
- customer screens
- product screens
- order screens
- accounting screens
- B2B portal
- admin panel
- tables, filters, forms
- navigation
- responsive layouts
- visual hierarchy
- empty / error / loading states
- UX flows (click paths), not domain rules

## 4.2 Forbidden

- Business rules, pricing formulas, VAT, ATP, credit holds
- Database, ORM, SQL, Redis
- Canonical REST/GraphQL contracts (placeholders only: `TODO: wire in Cursor`)
- Client-supplied `tenantId`
- JavaScript `number` used as money (mock copy is a string, e.g. `"12.50 GBP"`)
- Auth, RBAC, or tenant isolation implemented in the browser as security
- New apps or repos outside `apps/web` and `apps/admin`
- Vendure / ERPNext / Frappe / Shopify SDKs or branding
- Merging to `master`

Paste-in prompt: `docs/lovable-brief.md`.

---

# 5. Aider — controlled patch

Aider may:

- One named concern per session
- Rename, extract function, tighten types, small bugfix
- Add or update tests next to the change

Aider must not:

- Start a new phase
- Add packages or ADRs
- Rewrite architecture
- Invent UI from scratch (that is Lovable → Cursor)
- Skip hooks or commit secrets

Config: `.aider.conf.yml` and `AIDER.md`.  
Cursor reviews every Aider diff before it is done.

---

# 6. Per-phase UI surfaces

Lovable may prototype **only** the screens of the **approved** phase.  
Do not design later-phase modules early.

| Phase | Lovable surfaces (presentation) | Cursor production work |
|---|---|---|
| 0 | Foundation shells already exist | Complete |
| 1 | Sign-in, signed-in home, admin dashboard shell, tenant settings, organisations, users/roles, customers, suppliers, addresses, audit log. Tables, filters, forms, nav, responsive layout. | Identity, RBAC, APIs, port UI, tests |
| 2 | Product/catalog, price display, cart/checkout **structure**, orders, commerce availability. No invented discount math. | Commerce engine, PaymentProvider stub, port UI |
| 3 | CRM (lead, account, contact, opportunity, activity, quote, pipeline), B2B portal, company-buyer nav | CRM + B2B domain, port UI |
| 4 | Warehouse/location, stock movement list, purchase order, goods receipt | Inventory + procurement services, port UI |
| 5 | Chart of accounts, journal, GL, AR, AP, invoice, payment allocation. Amounts as strings. | Accounting engine, port UI. No in-browser balancing. |
| 6 | VAT return document, validation summary, **approval** control. No unattended submit. | Tax engine + HMRC adapter boundary, port UI |
| 7 | Assistant chat/draft UI. Human confirm for writes. | `packages/ai` tools over application services |

Shared on every screen set: navigation, visual hierarchy, empty/error/loading, responsive desktop + a mobile-width layout.

---

# 7. Handoff checklist (Lovable → Cursor)

1. Spec for the phase is approved (Phase 1) or addendum approved (Phase 2–7).
2. Lovable output matches the screen list above — extra modules are discarded.
3. Cursor copies layout/components into `apps/web` or `apps/admin`.
4. Mocks become API calls. Invented schemas are deleted.
5. RBAC: hide is not security; API still `requirePermission`.
6. Playwright covers the primary happy path.
7. Optional Aider pass for a named cleanup only.

---

# 8. Git / CI

All production changes go through the existing GitHub Actions workflow.

Lovable has no deploy role.  
Aider does not skip hooks.  
Cursor does not commit unless the human asks.

---

# 9. Relationship to product AI (Phase 7)

This document is about **how we build the OS**.  
Phase 7 is **product** AI inside the OS.  
They must not be mixed: Lovable is not the in-app assistant; Cursor is not allowed to let product AI bypass RBAC.
