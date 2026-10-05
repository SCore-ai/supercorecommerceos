# Database

This repository does not own a commerce or ERP database (ADR-010).

- **Vendure** stores catalog, cart, order, and payment state.
- **Frappe** stores Customer, Item, Sales Invoice, stock, and ledger documents.
- The bridge is stateless in the first slice: it verifies HMAC and POSTs to Frappe. Vendure `order.id` / `order.code` are external identifiers only.

Do not add a Drizzle schema here unless a later ADR introduces an `ExternalReference` table.
