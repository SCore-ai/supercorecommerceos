# Testing

- Unit: Vitest (`services/bridge/**/*.test.ts`)
- No Playwright suite in this repository (storefront lives in Vendure)
- No PostgreSQL/Redis integration tests here

Bridge coverage:

- HMAC-SHA256 webhook signature (accept / reject)
- Vendure order line → Frappe Sales Invoice item map (`item_code`, `qty`, `rate` as string)
- Ignore non-`PaymentSettled` transitions
- Customer then Sales Invoice POST order
