# AGENTS.md

Supercore Commerce OS — headless orchestration contract.

## Tooling

| Tool | Role |
|---|---|
| **Cursor** | Primary engineer. Specs, ADRs, the Vendure→Frappe bridge, tests, git. |
| **Lovable** | Storefront UI prototype only. Talks to Vendure GraphQL. No Frappe, no domain rules. |
| **Aider** | Named small patches. No architecture rewrites. |

Codex is not used.

## Runtime ownership (ADR-010)

```
Vendure     catalog, cart, checkout, payment capture
Frappe      stock, accounting, invoice documents
This repo   webhook bridge only — not a second commerce or ERP engine
```

Do not import `references/vendure` or `references/frappe` into production. Do not copy their SQL, GraphQL schemas, or DocTypes.

Shopify is not part of this architecture.

## Mandatory rules

1. Read `/specs` and ADRs before coding.
2. Never invent tax rates, discount stacking, or warehouse ATP in the bridge.
3. Architecture changes require an ADR.
4. External IDs are never our primary keys.
5. Never commit secrets.
6. Never bypass webhook signature checks.
7. Frontend (when present) has no business logic and no database access.
8. Every feature requires tests.
9. Keep changes small and reviewable.
