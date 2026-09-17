# ADR-005 API architecture

## Context

Frontends need a typed application API. Operations and webhooks need simple HTTP.

## Decision

- `apps/api` is a Hono server.
- GraphQL Yoga serves `/graphql` for application queries.
- REST is used for `/health`, `/ready`, `/live`.
- Route handlers must not contain domain logic. They call application services later.
- Web and admin are separate Next.js apps and consume the API over HTTP.

## Alternatives

- Next.js route handlers as the only API: weaker worker/API separation
- REST-only: acceptable, but GraphQL is the specified primary application API
- gRPC: unnecessary for Phase 0

## Consequences

GraphQL Yoga provides the schema. Application queries are executed through Yoga's envelop/execute path so the API does not depend on mismatched `graphql` module copies or Node/Web stream interop issues.

REST remains the health/readiness surface.
