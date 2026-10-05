# SUPERCORE COMMERCE OS

## Phase 7 — Supercore AI Specification v1.0

**Document type:** Phase charter  
**Status:** Draft direction  
**Depends on:** Phase 1 plus the domains the assistant is allowed to use  
**Date:** 2026-09-17

---

# 1. Purpose

Phase 7 adds **Supercore AI** as an assistant over existing engines.

It does not replace Commerce, CRM, Accounting, or Tax.
It cannot invent postings, orders, or HMRC filings.

```
User
 ↓
Assistant UI
 ↓
packages/ai
 ↓
application services (commerce, crm, accounting, tax, ...)
 ↓
domain + RBAC + audit
```

---

# 2. Hard rules

- Cursor is the coding tool; this phase is the **product** AI
- Codex is not part of the workflow
- AI cannot bypass domain rules or RBAC
- AI cannot submit HMRC filings
- AI cannot post immutable financial records except through accounting services and the same approvals as a human
- No cross-tenant context leakage
- Secrets are not logged

---

# 3. In scope (after addendum)

- `AIProvider` (model vendor replaceable)
- Tools that call existing application services
- Drafts that still require a human to send/approve

---

# 4. Out of scope until addendum

- Autonomous purchasing, refunds, or credit notes
- Unattended production agents
- Training on customer data without a privacy decision

---

# 5. Definition of done (after addendum)

- Every AI write goes through application services
- Audit shows the assisted actor
- Cross-tenant retrieval tests fail closed

---

# 6. Development agents and UI

Canonical: `specs/architecture/Supercore Commerce OS — Development Agent Architecture v1.0.md`.

This phase is **product** AI. It is not a replacement for Cursor/Lovable/Aider.

## 6.1 Lovable (this phase)

Assistant / draft chat UI, confirmation step before any write, empty/error states.

Do not hide approval. Do not design autonomous “run the business” controls.

## 6.2 Cursor

`packages/ai` tools that call existing application services, RBAC, audit of assisted actor, port UI, tests.

## 6.3 Aider

Optional small patch. No new autonomous tools.

---

# 7. Reference lookup

Vendure / ERPNext / Frappe CRM are **not** the product-AI source for this phase.

Keep using existing application services. Map: `specs/architecture/Supercore Commerce OS — External Reference Clones v1.0.md`.

