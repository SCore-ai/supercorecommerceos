# SUPERCORE COMMERCE OS

## Phase 6 — Supercore Tax and VAT Specification v1.0

**Document type:** Phase charter  
**Status:** Draft direction — rates and schemes not invented here  
**Depends on:** Phase 5 accounting; Phase 2 if tax is shown on orders  
**Date:** 2026-09-17

---

# 1. Purpose

Phase 6 builds the **canonical Supercore Tax Engine**.

```
Supercore Tax Engine
        ↓
VAT Return
        ↓
Validation
        ↓
Explicit approval
        ↓
HMRC Adapter (optional, replaceable)
```

HMRC is never canonical.
HMRC submission is forbidden without an approval record.
AI cannot file.

---

# 2. Interfaces (already reserved in Phase 0)

- `TaxProvider`
- `VATReturnProvider`
- `HMRCProvider`

Canonical implementation: `SupercoreTaxProvider`.
HMRC remains an adapter.

---

# 3. Out of scope until addendum and compliance review

- VAT rates
- Reverse charge / OSS / IOSS
- Making Tax Digital operating procedures
- Live HMRC credentials
- Any unattended “submit” button

---

# 4. Definition of done (after addendum)

- Tax is a domain service, not a frontend formula
- VAT return is a stored document
- Filing requires approval
- Adapter can be replaced

---

# 5. Development agents and UI

Canonical: `specs/architecture/Supercore Commerce OS — Development Agent Architecture v1.0.md`.

## 5.1 Lovable (this phase)

VAT return document, validation summary, explicit **approval** control.

Do not add an unattended “submit to HMRC” button. Do not compute VAT rates in the browser.

## 5.2 Cursor

`@supercore/tax` determination services, stored VAT return, approval record, HMRC adapter boundary, port UI, tests.

## 5.3 Aider

Optional small patch. No live HMRC credentials.

---

# 6. Reference lookup

Optional comparison: ERPNext tax/VAT modules under `references/erpnext/`.

Rates, schemes, and HMRC behaviour are not copied from there. Canonical: `specs/architecture/Supercore Commerce OS — External Reference Clones v1.0.md`.

