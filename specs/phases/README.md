# Specs / phases

This folder is the **only** phase document source: one Markdown file per phase, plus the roadmap. Matching `.docx` files sit beside the `.md` files.

Authoritative sequence: **Product Vision and Phase Roadmap v1.1**.

Phase 1 Platform Core is **implemented** on `master` at `7de6c75` (2026-10-05). §15 is aligned in `a0d709f`. Product close-out approved 2026-10-05. Phase 2 first-slice addendum closed 2026-10-05.

| File | Role |
|---|---|
| Product Vision and Phase Roadmap v1.1 | Active sequence (P0–P7) |
| Phase 0 Bootstrap Master Prompt | Historical foundation prompt |
| Phase 0 Completion Audit | Local completion report; remote CI bound to Actions run 37339984665 (`a0d709f`) |
| Phase 1 Platform Core | Implementation spec — `7de6c75`; §15 in `a0d709f`; close-out approved 2026-10-05 |
| Phase 2 Supercore Commerce Engine | Charter |
| Phase 2 Addendum First Slice | Closes charter §6 for catalog/cart/order/stub payment |
| Phase 3 Supercore B2B and CRM | Charter + first-decisions addendum approved 2026-10-05; first slice in `@supercore/crm` and `@supercore/b2b` |
| Phase 4 ERP / Inventory / Procurement | Charter |
| Phase 5 Supercore Accounting Engine | Charter |
| Phase 6 Supercore Tax and VAT | Charter |
| Phase 7 Supercore AI | Charter |

There is no Vendure phase and no ERPNext phase.

Comparison clones (not engines): `references/vendure`, `references/erpnext`, `references/frappe-crm`, `references/frappe`.  
How to use them: `specs/architecture/Supercore Commerce OS — External Reference Clones v1.0.md`.

Cross-cutting search/files/ops: `specs/architecture/`.

Development agents (Cursor / Lovable / Aider): `specs/architecture/Supercore Commerce OS — Development Agent Architecture v1.0.md`. That document applies to Phases 1–7. It is not a new phase.
