# SUPERCORE COMMERCE OS

## Phase 4 — ERP, Inventory and Procurement Foundations Specification v1.0

**Document type:** Phase charter  
**Status:** Draft direction  
**Depends on:** Phase 1 suppliers; Phase 2 catalog/SKU  
**Date:** 2026-09-17

---

# 1. Purpose

Phase 4 starts **Supercore ERP foundations**: warehouse inventory and procurement.

ERPNext is **not** installed and **not** required.
There is no ERPNext implementation phase.

```
Supercore ERP foundations
        ├── Warehouse / location
        ├── Stock item and movement
        ├── Reservation / adjustment
        ├── Purchase order
        └── Goods receipt
```

Commerce-facing availability from Phase 2 remains in `@supercore/commerce`.
Warehouse truth lives in `@supercore/inventory`.
Buying lives in `@supercore/procurement`.

---

# 2. Canonical vs adapter

```
AccountingProvider / future ERP adapter
        ├── Supercore (canonical operations in this phase)
        └── ERPNextAccountingProvider     (optional, unscheduled)
```

Do not run ERPNext to “fill the gap”.
If a later spec needs ERPNext as a temporary validation backend, it is an adapter only.

---

# 3. Out of scope until addendum

- Lot/serial/expiry
- ATP algorithm
- Three-way match
- Landed cost
- Reorder point formulas
- Full manufacturing / MRP

AP invoices are Phase 5.

---

# 4. Definition of done (after addendum)

- Stock movements are auditable
- Receipts increase stock only through inventory services
- Purchase orders reference Phase 1 suppliers
- No ERPNext runtime

---

# 5. Development agents and UI

Canonical: `specs/architecture/Supercore Commerce OS — Development Agent Architecture v1.0.md`.

## 5.1 Lovable (this phase)

Warehouse/location, stock movement list, reservation/adjustment **forms**, purchase order list/detail, goods receipt.

Shared: admin tables, filters, forms, navigation, responsive layout.

Do not invent ATP, reorder-point, or landed-cost calculators in the UI.

## 5.2 Cursor

`@supercore/inventory` and `@supercore/procurement` services, APIs, audit of movements, port UI, tests. Receipts increase stock only through inventory services.

## 5.3 Aider

Optional small patch. No ERPNext adapter work unless a later spec asks for it.

---

# 6. Reference lookup

Primary comparison trees: `references/erpnext/` (stock, buying) and `references/frappe/`.

Do not run ERPNext. Do not copy ATP/MRP. Canonical: `specs/architecture/Supercore Commerce OS — External Reference Clones v1.0.md`.

