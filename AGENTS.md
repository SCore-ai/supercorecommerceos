# AGENTS.md

Supercore Commerce OS engineering contract for humans and AI agents.

## Tooling

| Tool | Role |
|---|---|
| **Cursor** | Primary engineer. Implementation, debugging, tests, git, domain/API work, and the only path that lands production code in this repository. |
| **Lovable** | UI/UX and frontend start/prototyping only. Visual concepts for `apps/web` and `apps/admin`. No domain rules, no database, no canonical API. |
| **Aider** | Controlled second engineer. Small, reviewable refactors and focused patches. No architecture rewrites. |

Codex is not part of the Supercore Commerce OS development workflow.

Handoff:

1. Spec stays in `/specs`. Cursor (or a human) writes or updates it.
2. Lovable may prototype screens from `docs/lovable-brief.md`. Output is a sketch, not the system of record.
3. Cursor ports accepted UI into `apps/web` / `apps/admin` and wires it to the HTTP API.
4. Aider may then apply a named, small refactor with tests.

Frontend must not contain business logic or database access. Generated code is never trusted automatically.

Canonical write-up: `specs/architecture/Supercore Commerce OS — Development Agent Architecture v1.0.md`.  
Operational notes: `docs/tooling.md`.

## Project facts

This is a greenfield project. No migration system is required.

Shopify is not part of this architecture.

External platforms are not canonical domain owners.

Vendure, ERPNext, and Frappe CRM are replaceable integrations only. They are not installed in Phase 0–1, and they have no dedicated implementation phase.

Read-only upstream clones may live under `references/` (gitignored) for comparison. They are not the system of record. Do not import them into apps or packages.

Do not add Shopify, Vendure, Saleor, ERPNext, or Frappe CRM implementations unless a later approved specification explicitly requires an optional adapter.

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
4. If a modelling question needs a comparison, search `references/` and cite the path. Do not copy their rules unless the spec already allows it.
5. Produce an implementation plan.
6. Implement the smallest coherent change.
7. Run tests.
8. Review changes.
9. Update documentation.

Never blindly rewrite large portions of the repository.
Never create duplicate systems when an existing abstraction already exists.

## Phase sequence

Authoritative document: `specs/phases/Supercore Commerce OS — Product Vision and Phase Roadmap v1.1.md`.

Phase 0 Foundation (complete) → Phase 1 Platform Core → Phase 2 Supercore Commerce → Phase 3 B2B + CRM → Phase 4 ERP/Inventory/Procurement foundations → Phase 5 Accounting → Phase 6 Tax/VAT → Phase 7 AI.

Do not implement a later phase until its specification is approved.
Do not create Vendure or ERPNext phases.
The original Phase 0 Master Prompt is historical; §§37–39 are interpreted by the Completion Audit, not as a requirement to install those products.

## Package boundaries

Intended dependencies:

- `@supercore/core`: platform primitives, Phase 1 master data and the single Drizzle migrator (ADR-009). No domain packages depend upward into apps.
- `@supercore/identity`: may depend on `core`. Auth/session/RBAC behavior; not customer/supplier tables.
- `@supercore/events`: may depend on `core`.
- `@supercore/integrations`, `@supercore/search`, `@supercore/files`: adapter boundaries.
- Domain packages (`commerce`, `b2b`, `crm`, `accounting`, `inventory`, `procurement`, `tax`, `payments`, `ai`) must not import each other unless a later ADR allows it.
- `apps/web` and `apps/admin` talk to the API over HTTP. They must not import database clients.
- `apps/api` and `services/worker` may import platform packages.

Arbitrary cross-module imports are forbidden.
