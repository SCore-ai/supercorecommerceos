# ADR-002 Canonical data ownership

## Context

The product must be owned by Supercore. External engines must remain replaceable.

This repository is greenfield. There is no historical data migration.

## Decision

Supercore owns the canonical domain model and identifiers.

External platforms are not source-of-truth.

Shopify is not part of this architecture.

Vendure, Saleor, ERPNext, Frappe CRM, HMRC, payment providers, and shipping providers may later appear only as adapters.

## Alternatives

- Make an external commerce engine the system of record: rejected
- Build importers/migration tooling in Phase 0: rejected

## Consequences

Adapter interfaces live in `packages/integrations`. External IDs are stored separately, never as primary keys.
