# Lovable brief — Supercore Commerce OS

Paste this into Lovable when starting a UI prototype. Do not treat Lovable output as production.

Canonical roles: `specs/architecture/Supercore Commerce OS — Development Agent Architecture v1.0.md`.

## Product

Supercore Commerce OS operator and admin shells.

Apps to design for:

- `apps/web` — signed-in operator / later B2B portal shell
- `apps/admin` — admin panel

Stack to match when exporting: Next.js App Router, Tailwind CSS, shadcn/ui, TypeScript.

## Your job

UI/UX only:

- dashboard
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
- UX flows (screens and click paths)

You do **not** write business logic, APIs, databases, tax, stock, or pricing rules.

## Pipeline

```
Requirement → Spec → Lovable prototype → Next.js/Tailwind/shadcn
        → Cursor ports into the monorepo → production
```

## Screens by phase

Prototype **only** the phase you are asked for.

### Phase 1 (current when Platform Core is in play)

- Sign in
- Signed-in home / dashboard shell
- Tenant settings
- Organisations
- Users and roles
- Customers (list, detail, form)
- Suppliers (list, detail, form)
- Addresses
- Audit log (read-only table)

No catalog, cart, checkout, invoices, stock, CRM pipeline, or AI chat.

### Phase 2

- Product / catalog
- Order list and detail
- Cart / checkout **layout** (no invented totals logic)
- Commerce availability display

### Phase 3

- CRM: lead, account, contact, opportunity, activity, quote, pipeline
- B2B portal shell and company-buyer navigation

### Phase 4

- Warehouse / location
- Stock movements
- Purchase orders
- Goods receipts

### Phase 5

- Chart of accounts, journal, GL, AR, AP, invoice, payment allocation
- Show money as strings such as `"12.50 GBP"`

### Phase 6

- VAT return document
- Validation summary
- Explicit **approval** control — no unattended submit

### Phase 7

- Assistant / draft UI
- Human confirm before any write

## Hard constraints

1. Presentation only. No business rules in the UI.
2. No database, ORM, or SQL.
3. No `tenantId` from the client. Tenant comes from the session on the API.
4. Do not invent REST or GraphQL contracts. Call existing `/health` and later documented API routes only as placeholders (`TODO: wire in Cursor`).
5. Do not add Shopify, Vendure, ERPNext, or Frappe branding or SDKs.
6. Do not create a new repository structure. Target `apps/web` and `apps/admin` only.
7. Money, if shown as mock copy, is a string such as `"12.50 GBP"` — never a JavaScript number used as money.
8. English UI copy unless a later spec says otherwise.

## Handoff

When a screen is accepted, Cursor copies it into this monorepo, replaces mocks with API calls, and adds tests. Lovable does not merge to `master`.
