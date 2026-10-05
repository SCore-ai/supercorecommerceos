# ADR-004 Adapter architecture

## Context

Integrations must not own Supercore business logic.
Vendure and ERPNext must not be treated as required runtimes.

## Decision

Define provider interfaces:

- CommerceProvider
- AccountingProvider
- CRMProvider
- PaymentProvider
- ShippingProvider
- AIProvider
- TaxProvider
- HMRCProvider
- VATReturnProvider
- SearchProvider
- FileStorageProvider

Canonical implementations (later phases, still Supercore-owned):

- SupercoreCommerceProvider
- SupercoreCRMProvider
- SupercoreAccountingProvider
- SupercoreTaxProvider

Optional unscheduled adapters (not a delivery commitment):

- VendureCommerceProvider
- FrappeCRMProvider
- ERPNextAccountingProvider

No external provider implementations ship in Phase 0 or Phase 1.

## Alternatives

- Embed Vendure/ERPNext/Frappe in the domain: rejected
- Skip interfaces until an external vendor is chosen: rejected; boundaries stay

## Consequences

A later phase may add an optional adapter without rewriting canonical engines.
Absence of Vendure/ERPNext/Frappe is the default.
