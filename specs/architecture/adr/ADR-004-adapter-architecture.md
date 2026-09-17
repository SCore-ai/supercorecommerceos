# ADR-004 Adapter architecture

## Context

Integrations must not own Supercore business logic.

## Decision

Define provider interfaces only:

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

No provider implementations ship in Phase 0.

## Alternatives

- Embed a specific engine in the domain: rejected
- Delay all interfaces until Phase 1: rejected; boundaries are cheaper now

## Consequences

Future adapters implement these interfaces. Domain code depends on the interface, not the vendor.
