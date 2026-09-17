# ADR-003 ID strategy

## Context

The platform needs stable internal identifiers and, later, human-meaningful business IDs.

Sequential business IDs should not be database primary keys because of contention and leaking.

## Decision

- Internal PKs are UUIDv7 generated in application code.
- Business IDs are a separate nullable abstraction.
- Business numbering rules are not implemented in Phase 0.
- External provider IDs are never canonical.

## Alternatives

- Database serial PKs: weaker for distribution and merging
- UUIDv4 only: valid, but UUIDv7 sorts better in indexes
- Encode `SC-CUS-000001` in the database PK: rejected

## Consequences

Phase 1 entities should use `id` (UUIDv7) plus optional `businessId`. A numbering service can be added later.
