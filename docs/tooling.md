# Tooling

Supercore uses three AI tools. They are not interchangeable.

```
                    SUPERCORE DEVELOPMENT
                           │
          ┌────────────────┼────────────────┐
          │                │                │
       CURSOR           LOVABLE           AIDER
      MAIN DEV      STOREFRONT UX     CONTROLLED PATCH
          │                │                │
          └────────────────┼────────────────┘
                           │
                        Git / CI
```

| Tool | Role | Lands code in this repo? |
|---|---|---|
| **Cursor** | Specs, ADRs, Vendure→Frappe bridge, tests, git. | Yes |
| **Lovable** | Storefront UI prototype. Talks to Vendure GraphQL only. | No — Cursor ports accepted screens later |
| **Aider** | Named, small refactor or patch. | Yes, only the files in that patch |

Codex is not used.

## Cursor

Work from `AGENTS.md` and **ADR-010**.

Do not invent tax rates, discount stacking, or warehouse ATP in the bridge. Do not import `references/` into production packages.

Vendure and Frappe are **external runtimes**, not packages in this monorepo.

## Lovable

Allowed: storefront screens against **Vendure Shop GraphQL**.

Forbidden: Frappe REST from the browser, domain formulas, database clients, copying Vendure Admin UI.

## Aider

Run from the repository root with `.aider.conf.yml`.

Allowed: rename, extract function, tighten types, small bugfix, add a test next to a change.

Forbidden: new engines, ADR-worthy architecture, bulk rewrites, committing secrets, `--no-verify`, copying clone source.

## Protocol

SPEC → PLAN → IMPLEMENT → TEST → REVIEW → DOCUMENT
