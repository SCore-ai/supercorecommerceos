# External reference clones

These trees are **read-only architecture and code references**. They are not installed runtimes and not canonical Supercore engines.

| Directory | Upstream | Why it is here |
|---|---|---|
| `vendure/` | https://github.com/vendure-ecommerce/vendure | Commerce catalog, order, pricing, plugin patterns |
| `erpnext/` | https://github.com/frappe/erpnext | Accounting, inventory, procurement, ERP documents |
| `frappe-crm/` | https://github.com/frappe/crm | CRM lead/deal/contact/organization patterns |
| `frappe/` | https://github.com/frappe/frappe | Framework ERPNext and Frappe CRM sit on |

Rules:

1. Canonical product remains `specs/` and this repository’s `apps/` / `packages/`.
2. Do not import these projects into `@supercore/*`.
3. Do not run their installers, Docker stacks, or benches unless a later approved spec asks for a throwaway comparison.
4. Do not copy business rules from them into Supercore without an approved spec.
5. Optional adapters (`VendureCommerceProvider`, `ERPNextAccountingProvider`, `FrappeCRMProvider`) stay unscheduled.

Binding spec for how Cursor uses these trees: `specs/architecture/Supercore Commerce OS — External Reference Clones v1.0.md`.

Clones are gitignored. Recreate with:

```bash
git clone --depth 1 https://github.com/vendure-ecommerce/vendure.git references/vendure
git clone --depth 1 https://github.com/frappe/erpnext.git references/erpnext
git clone --depth 1 https://github.com/frappe/crm.git references/frappe-crm
git clone --depth 1 https://github.com/frappe/frappe.git references/frappe
```
