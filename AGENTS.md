# AGENTS.md

Supercore Commerce OS engineering contract for humans and AI agents.

## Tooling

Cursor is the primary development tool.

Aider may be used later for controlled refactoring or focused patches.

Codex is not part of the Supercore Commerce OS development workflow.

## Project facts

This is a greenfield project. No migration system is required.

Shopify is not part of this architecture.

External platforms are not canonical domain owners.

Do not add Shopify, Vendure, Saleor, ERPNext, or Frappe CRM implementations in this repository unless a later specification explicitly requires an adapter.

## Mandatory rules

1. Read `/specs` before implementing domain functionality.
2. Never invent business rules.
3. Never change architecture silently.
4. Architecture changes require an ADR.
5. Database changes require migrations.
6. Never delete financial records.
7. Posted financial transactions are immutable.
8. Financial entries must balance.
9. No business logic in frontend.
10. No direct database access from frontend.
11. External systems use adapters.
12. External IDs are never canonical IDs.
13. All financial changes require audit trails.
14. Never commit secrets.
15. Never bypass validation.
16. AI cannot bypass domain rules.
17. AI cannot autonomously submit HMRC filings without explicit approval.
18. Never introduce microservices without an ADR.
19. Every feature requires tests.
20. Every feature requires documentation.
21. Prefer simple architecture over unnecessary abstraction.
22. Preserve backwards compatibility unless explicitly approved.
23. Do not modify unrelated code during a task.
24. Keep changes small and reviewable.
25. Run relevant tests before declaring completion.

## Development protocol

SPEC → PLAN → IMPLEMENT → TEST → REVIEW → DOCUMENT

Before substantial changes:

1. Inspect the repository.
2. Read relevant specs.
3. Identify dependencies.
4. Produce an implementation plan.
5. Implement the smallest coherent change.
6. Run tests.
7. Review changes.
8. Update documentation.

Never blindly rewrite large portions of the repository.
Never create duplicate systems when an existing abstraction already exists.

## Phase 0 scope

Phase 0 is foundation only. Do not implement Product, Customer, Order, Cart, Checkout, Pricing, CRM, Accounting, Inventory, Procurement, Tax, Payments, ERP, AI agents, HMRC submission, or shipping/payment gateways until a later phase specification exists.

## Package boundaries

Intended dependencies:

- `@supercore/core`: platform primitives. No domain packages depend upward into apps.
- `@supercore/identity`: may depend on `core`.
- `@supercore/events`: may depend on `core`.
- `@supercore/integrations`, `@supercore/search`, `@supercore/files`: adapter boundaries.
- Domain packages (`commerce`, `b2b`, `crm`, `accounting`, `inventory`, `procurement`, `tax`, `payments`, `ai`) must not import each other unless a later ADR allows it.
- `apps/web` and `apps/admin` talk to the API over HTTP. They must not import database clients.
- `apps/api` and `services/worker` may import platform packages.

Arbitrary cross-module imports are forbidden.
