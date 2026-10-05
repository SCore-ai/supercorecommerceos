# ADR-002 Canonical data ownership

## Context

The product must be owned by Supercore. External engines must remain replaceable.

This repository is greenfield. There is no historical data migration.

ChatGPT or other assistants must not reintroduce Vendure, ERPNext, or Frappe CRM as required platforms.

## Decision

Supercore owns the canonical domain model, identifiers, and engines:

- Supercore Commerce Engine (Phase 2)
- Supercore CRM (Phase 3)
- Supercore Accounting Engine (Phase 5)
- Supercore Tax Engine (Phase 6)

Shopify is not part of this architecture.

Vendure, ERPNext, and Frappe CRM:

- are **not** installed in Phase 0 or Phase 1
- have **no** dedicated implementation phase
- may later exist only as optional adapters if a later spec justifies them

HMRC, payment providers, shipping providers, and supplier APIs are also replaceable integrations, never canonical owners.

External IDs are never primary keys.

## Alternatives

- Make Vendure or ERPNext the system of record: rejected
- Schedule Vendure/ERPNext phases because the tools exist: rejected
- Build importers/migration tooling in Phase 0: rejected

## Consequences

```
CommerceProvider    → SupercoreCommerceProvider (canonical)
                      VendureCommerceProvider (optional, unscheduled)
CRMProvider         → SupercoreCRMProvider (canonical)
                      FrappeCRMProvider (optional, unscheduled)
AccountingProvider  → SupercoreAccountingProvider (canonical)
                      ERPNextAccountingProvider (optional, unscheduled)
```

Domain code depends on Supercore services. Adapters are opt-in.
