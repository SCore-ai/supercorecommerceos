# SUPERCORE COMMERCE OS

## Cross-cutting Platform Services Specification v1.0

**Document type:** Boundary specification (not a numbered phase)  
**Location:** `specs/architecture/` — do not treat this as Phase 8+  
**Status:** Draft direction  
**Depends on:** Phase 0 interfaces; domains as they exist  
**Date:** 2026-09-17

---

# 1. Purpose

Search, files, reporting, workflow, shipping, supplier APIs, backups, and production deploy are **platform capabilities**.

They are not extra phases.
They do not restore Vendure, ERPNext, or Frappe CRM as engines.

Implement a capability when a domain needs it, behind the Phase 0 interface.

---

# 2. Reserved interfaces (already in the repo)

| Interface | Package | Notes |
|---|---|---|
| `SearchProvider` | `@supercore/search` | Meilisearch/OpenSearch later; never domain-coupled |
| `FileStorageProvider` | `@supercore/files` | S3-compatible later; local disk is not canonical |
| `ShippingProvider` | `@supercore/integrations` | Carrier chosen later; rates/labels not invented here |
| `PaymentProvider` | `@supercore/integrations` | Capture in Phase 2; allocation in Phase 5 |
| `HMRCProvider` / `VATReturnProvider` | `@supercore/integrations` | Phase 6; approval gate required |
| `CommerceProvider` / `CRMProvider` / `AccountingProvider` / `TaxProvider` | `@supercore/integrations` | Canonical implementations are Supercore engines |

---

# 3. Operations (when needed)

- Job / health / error dashboards
- Documented PostgreSQL backup/restore
- GitHub Actions expansion
- NGINX / TLS topology only with a deployment ADR
- SaaS provisioning and suspension after Phase 1 tenants exist

---

# 4. Out of scope

- Kubernetes unless an ADR approves it
- Kafka / RabbitMQ (Redis + BullMQ remain the job backbone)
- Shopify apps
- Making an external SaaS the canonical database
- Unattended production deploys
- Installing Vendure, ERPNext, or Frappe CRM because they exist

---

# 5. Reporting

Reports read Supercore data.
They are not a second system of record.
Financial reports must not use JavaScript `number` aggregation.

---

# 6. Definition of done (per capability, after addendum)

- The capability is behind a replaceable interface
- Tenant isolation holds
- Secrets are not logged
- No external engine became source-of-truth
