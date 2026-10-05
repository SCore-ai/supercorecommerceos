# Lovable brief — Vendure storefront (later)

Paste this into Lovable when starting a storefront prototype. Do not treat Lovable output as production.

Canonical runtime: **ADR-010**. Vendure owns catalog/cart/checkout. Frappe is not called from the browser.

## Product

Headless storefront against **Vendure Shop GraphQL**.

Stack when exporting: Next.js App Router, Tailwind CSS, shadcn/ui, TypeScript.

## Your job

UI/UX only: catalog, product, cart, checkout, account screens.

You do **not** write tax, stock, pricing rules, Frappe REST, or databases.

## Forbidden

- Inventing GraphQL schemas
- Calling Frappe/ERPNext from the client
- Copying Vendure Admin UI
- Business logic
