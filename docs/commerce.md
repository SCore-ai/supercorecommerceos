# Commerce

Commerce operations live in **Vendure** (ADR-010). This repository does not run a catalog, cart, or checkout.

Completed orders (`toState === PaymentSettled`) are forwarded by `services/bridge` to Frappe as a Sales Invoice. Tax rates, stock ATP, and payment capture stay in Vendure/Frappe configuration.
