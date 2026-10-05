# Architecture specs

Phase 0 established the modular monolith, adapter boundaries, identity/tenant context, and ID/money strategies.

Canonical engines (later phases, still Supercore-owned): Commerce (2), CRM (3), Accounting (5), Tax (6).

Vendure, ERPNext, and Frappe CRM have no dedicated phase. Optional adapters only.

Cross-cutting search/files/ops: `Supercore Commerce OS — Cross-cutting Platform Services Specification v1.0.md` in this folder.

Tooling (ADR-008): Cursor primary engineer, Lovable UI prototype, Aider small refactors. Codex is not used.

Canonical: `Supercore Commerce OS — Development Agent Architecture v1.0.md` in this folder. Operational: `docs/tooling.md`.

Canonical product documents: `specs/phases/` and `specs/architecture/`.

Comparison clones: `specs/architecture/Supercore Commerce OS — External Reference Clones v1.0.md` and `references/`.

Do not invent commerce, CRM, or accounting business rules here. Authoritative sequence: Product Vision and Phase Roadmap v1.1.
