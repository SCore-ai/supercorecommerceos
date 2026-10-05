# Tooling

Supercore uses three AI tools. They are not interchangeable.

Canonical spec: `specs/architecture/Supercore Commerce OS — Development Agent Architecture v1.0.md`.

```
                    SUPERCORE DEVELOPMENT
                           │
          ┌────────────────┼────────────────┐
          │                │                │
       CURSOR           LOVABLE           AIDER
      MAIN DEV         UI/UX DEV      CONTROLLED PATCH
          │                │                │
          └────────────────┼────────────────┘
                           │
                        Git / CI
```

| Tool | Role | Lands code in this repo? |
|---|---|---|
| **Cursor** | Ana mühendis. Spec, domain, API, worker, tests, git, CI, and production UI wiring. | Yes |
| **Lovable** | UI/UX and frontend başlangıç / prototipleme. | No — Cursor ports accepted screens |
| **Aider** | Kontrollü ikinci mühendis. Named, small refactor or patch. | Yes, only the files in that patch |

Codex is not used.

## Cursor

Work from `AGENTS.md` and `/specs`.

Do not invent business rules. Do not skip tests. Do not install Vendure, ERPNext, or Frappe CRM.

Comparison clones: `references/`. Map: `specs/architecture/Supercore Commerce OS — External Reference Clones v1.0.md`. Cite the path if you use them. Specs win.

## Lovable

Use `docs/lovable-brief.md` as the prompt.

Allowed: dashboard, admin panel, B2B portal, CRM/customer/product/order/accounting **screens**, tables, filters, forms, navigation, responsive layout, visual hierarchy, UX flows.

Forbidden: domain formulas, tenant isolation logic, money math, GraphQL schema invention, database clients, new apps outside `apps/web` and `apps/admin`.

A Lovable export is a prototype. Cursor copies the accepted presentation into this monorepo and binds it to existing API contracts.

```
Requirement → Spec → Lovable → UI/UX prototype → component structure
        → Next.js / Tailwind / shadcn → Cursor → production code
```

## Aider

Run from the repository root with `.aider.conf.yml`.

Allowed: rename, extract function, tighten types, small bugfix, add a test next to a change.

Forbidden: new phases, new packages, ADR-worthy architecture, bulk rewrites, committing secrets, `--no-verify`.

Keep the Aider session to one concern. Cursor reviews the diff before it is considered done.

## Protocol

SPEC → PLAN → IMPLEMENT → TEST → REVIEW → DOCUMENT

Lovable may sit inside PLAN (visual) only. IMPLEMENT of production code is Cursor, with Aider as an optional second pass.
