# SUPERCORE COMMERCE OS

## Phase 3 — Addendum First Decisions v1.0

**Document type:** Approved addendum to the Phase 3 charter  
**Status:** Approved 2026-10-05. Probabilities, tax rows, and the credit formula are copied from the clones on product approval the same day.  
**Depends on:** Phase 1 Platform Core; Phase 2 first-slice addendum and `placeOrderRecord` / `addCartLine` in `@supercore/commerce`  
**Does not include:** Lead scores, quantity-break formulas, punchout/EDI, Frappe as system of record

---

# 1. Why this file exists

The Phase 3 charter left eight decisions unwritten and forbade inventing them in code. This addendum closes those eight. Lookup was comparison only. Paths below were read. Nothing in `references/` is imported.

Binding map: `specs/architecture/Supercore Commerce OS — External Reference Clones v1.0.md`. Phase 3 primary tree is `references/frappe-crm/`. That map says pipeline probabilities are not a Supercore rule until an approved spec takes them. This addendum is that approval. Frappe is still not the system of record. Money is `numeric(19, 4)` and decimal.js (ADR-007), not Python `float`. The arithmetic is the clone’s arithmetic.

---

# 2. Closed decisions

## 2.1 CRM Account and Phase 1 Customer

Looked up:

| Source | Path | What it does |
|---|---|---|
| Frappe CRM Organization | `references/frappe-crm/crm/fcrm/doctype/crm_organization/crm_organization.json` | A named company. Not an ERPNext Customer. |
| Frappe → ERPNext customer | `references/frappe-crm/crm/fcrm/doctype/erpnext_crm_settings/erpnext_crm_settings.py` (`create_customer_in_erpnext`, `create_customer_from_deal`) | Creates a Customer only when settings are enabled and the deal status matches. Organization name becomes a Company customer. No organization uses the primary contact name as an Individual customer. |
| ERPNext Customer | `references/erpnext/erpnext/selling/doctype/customer/customer.json` (`is_internal_customer`, `represents_company`) | Internal customer is inter-company, not a SaaS tenant. |
| Vendure Customer | `references/vendure/packages/core/src/entity/customer/customer.entity.ts` | A person. Optional `User`. No Account. |

Decision:

- CRM Account is its own row. It is not a Phase 1 Customer and not a Phase 1 Organization.
- They are the same party only when `customerId` is set to a Customer in the same tenant. No match on email, name, or website.
- Creating an Account does not create a Customer. Creating a Customer does not create an Account.
- `organizationId` is optional and, when set, points at a Phase 1 Organization in the same tenant. That link is also explicit.
- Rejected: automatic Customer creation on a deal status. Rejected: Vendure’s person-as-customer as the Account. Rejected: ERPNext internal customer as the tenant model.

## 2.2 Pipeline stage names and probabilities

Looked up: `references/frappe-crm/crm/install.py` `add_default_deal_statuses` and `add_default_lead_statuses`. Deal status change copies that row’s probability onto the deal (`references/frappe-crm/crm/fcrm/doctype/fcrm_settings/fcrm_settings.py` `get_forecasting_script`).

Decision:

- A pipeline is an ordered list of stages for one tenant.
- A deal stage has `name`, `position`, `outcome` (`open`, `ongoing`, `won`, `lost`), and `probability` copied from the install seed:

| Position | Name | Outcome | Probability |
|---|---|---|---|
| 1 | Qualification | open | 10 |
| 2 | Demo/Making | ongoing | 25 |
| 3 | Proposal/Quotation | ongoing | 50 |
| 4 | Negotiation | ongoing | 70 |
| 5 | Ready to Close | ongoing | 90 |
| 6 | Won | won | 100 |
| 7 | Lost | lost | 0 |

- Setting an opportunity’s stage sets `probability` from that stage. The client cannot send a different percent.
- Lead statuses have no probability in the Frappe seed. Supercore does not add one.

| Position | Name | Outcome |
|---|---|---|
| 1 | New | open |
| 2 | Contacted | ongoing |
| 3 | Nurture | ongoing |
| 4 | Qualified | won |
| 5 | Unqualified | lost |
| 6 | Junk | lost |

- Frappe also seeds a lead status `Converted`. Supercore does not. Conversion is a flag, matching `convert_to_deal` in `references/frappe-crm/crm/fcrm/doctype/crm_lead/crm_lead.py`: set `converted` and set status to `Qualified`. A lead whose status outcome is `lost` cannot convert.

## 2.3 Lead scoring

Looked up: `references/frappe-crm/crm/fcrm/doctype/crm_lead/crm_lead.json` has no score field.

Decision: Phase 3 has no lead score column and no scoring job.

## 2.4 Quantity-break formulas

Looked up: `references/erpnext/erpnext/accounts/doctype/pricing_rule/pricing_rule.json` (`min_qty`, `max_qty`, `min_amt`). That is a price formula. Phase 2 addendum §2.1 prices a line as `quantity × unitPrice` from the list price and leaves discount stacking out of the slice. Vendure `CustomerGroup` (`references/vendure/packages/core/src/entity/customer-group/customer-group.entity.ts`) groups people for promotions and tax, not for a quantity break.

Decision: Phase 3 does not store or evaluate quantity breaks, amount breaks, or customer-group price rules.

Catalog access structure (charter §3):

- Table `account_catalog_products` (`accountId`, `productId`), both in the same tenant. `productId` is a Phase 2 product.
- A B2B buyer’s catalog list is the intersection of the Phase 2 catalog and that account’s rows.
- Zero rows means the buyer sees no products.
- A tenant user with `catalog.read` is not filtered by this table.

## 2.5 Credit holds

Looked up: `references/erpnext/erpnext/selling/doctype/customer/customer.py` `check_credit_limit`, `get_customer_outstanding`, `get_credit_limit`.

Decision — the formula is copied:

- Outstanding = GL party balance + unbilled sales orders + unbilled delivery notes.
- GL = `sum(debit) - sum(credit)` on `party_ledger_entries` for that customer in the tenant, `is_cancelled = false`. The tenant stands in for ERPNext `company` (Phase 1: ERPNext Company is not our tenant).
- Unbilled orders = `sum(grand_total * (100 - per_billed) / 100)` for `placed` orders with `per_billed < 100`. `bypass_outstanding_orders` on the limit row omits this term (`ignore_outstanding_sales_order`).
- Unbilled deliveries = the ERPNext delivery-note term: for each submitted note whose status is not `Closed` or `Stopped` and whose `base_net_total > 0`, each item with `amount > billed_amount` and empty `against_sales_order` and `against_sales_invoice` adds `(amount - billed_amount) / base_net_total * base_grand_total`.
- Limit lookup: customer limit, else customer-group limit unless that row’s `bypass_credit_limit_check` is set, else the tenant default. A missing or zero limit does not block (`if not credit_limit: return`).
- If `extra_amount > 0`, add it before the comparison. If limit `> 0` and outstanding `>` limit, users without `credit.override` are rejected. `finance` has `credit.override` (the credit-controller role). No outbound email (Phase 1 decision: no mail product).

## 2.6 Quote conversion to a Phase 2 order

Looked up:

| Source | Path | What it does |
|---|---|---|
| Frappe lead → deal | `references/frappe-crm/crm/fcrm/doctype/crm_lead/crm_lead.py` `convert_to_deal` | Creates contact, organization, and deal. Does not create an order. Refuses a lost lead. |
| ERPNext quotation → sales order | `references/erpnext/erpnext/selling/doctype/quotation/mapper.py` `make_sales_order` | Requires submitted quotation (`docstatus = 1`). Refuses a past `valid_till`. Then recalculates taxes and copies tax rows. |
| Vendure | `references/vendure/packages/core/src/service/services/order.service.ts` | “Quote” there is a shipping or payment method price, not a CRM quotation. No quotation entity. |
| Supercore checkout | `packages/commerce/src/checkout.ts` `addCartLine`, `placeOrderRecord` | Cart line price comes from the variant list price. Place-order checks out that user’s open cart. |

Decision:

- A Quote belongs to one Opportunity. Status is `draft`, `accepted`, `expired`, or `converted`.
- Only `accepted` may convert. `validUntil` is a date. If it is set and is before today, conversion is refused (`references/erpnext/erpnext/selling/doctype/quotation/mapper.py` `valid_till`). A draft or accepted quote past that date is read as `expired`.
- A quote converts at most once. The resulting Phase 2 order id is stored on the quote. The quote is not an order.
- Quote lines are `variantId` + quantity. Net amounts come from the Phase 2 list price at conversion (`addCartLine`).
- Tax rows are copied from `references/erpnext/erpnext/accounts/doctype/sales_taxes_and_charges/sales_taxes_and_charges.json` and calculated as in `references/erpnext/erpnext/controllers/taxes_and_totals.py` `calculate_taxes`, `determine_exclusive_rate`, and `calculate_totals`. Charge types: `Actual`, `On Net Total`, `On Previous Row Amount`, `On Previous Row Total`, `On Item Quantity`. `row_id` is 1-based. `included_in_print_rate` backs the net out of the printed amount. Grand total is the last row’s cumulative total, or the net when there are no rows. `total_taxes_and_charges = grand_total - net_total`. No discount stacking and no chart of accounts: `account_head` is a label, not a Phase 5 account id.
- Those computed rows are stored on the quote and copied onto the Phase 2 order inside `placeOrderRecord`. The stub payment amount is the grand total when tax rows are present.
- Conversion refuses when the actor already has an open cart that has lines. Otherwise it adds each quote line with `addCartLine` and then calls `placeOrderRecord` with the Account’s `customerId`. Stock decrement stays inside that Phase 2 transaction. Credit is checked first with `extra_amount` = grand total.
- If `customerId` is null, conversion fails. It does not create a Customer.
- The actor is the signed-in tenant user. Super Admin cannot convert (Phase 2: Super Admin cannot own a cart).

## 2.7 B2B company user

Looked up:

| Source | Path | What it does |
|---|---|---|
| ERPNext portal | `references/erpnext/erpnext/selling/doctype/customer/customer.json` (`portal_users`); `references/erpnext/erpnext/utilities/doctype/portal_user/portal_user.json` | Child rows of User on a Customer. |
| Vendure | `references/vendure/packages/core/src/entity/customer/customer.entity.ts` | Optional one-to-one User. A guest Customer has no User. |

Decision:

- A B2B buyer is an existing Phase 1 User in the same tenant. No second user table.
- Membership is `(accountId, userId)`, unique. Super Admin cannot be a member.
- If the Account has `organizationId`, the user must already have a Phase 1 membership of that Organization. The check is a precondition on insert. It does not create the organization membership.
- Buyer catalog calls use this membership. They do not grant CRM write.

## 2.8 Still not taken from the clones

Punchout, EDI, marketing automation, SLA, telephony, and domain-enrichment stay out. Frappe Organization `exchange_rate` is a float and is not stored (ADR-007). HubSpot, Salesforce, and Frappe are not the system of record.

---

# 3. Permissions for this slice

Existing Phase 1 roles. `tenant_admin` still receives every tenant permission.

| Permission | tenant_admin | manager | sales | viewer | B2B member |
|---|---|---|---|---|---|
| `crm.read` | yes | yes | yes | yes | no |
| `crm.write` | yes | yes | yes | no | no |
| `b2b.manage` | yes | yes | no | no | no |
| `b2b.buy` | no | no | no | no | yes, on that account only |

`b2b.buy` is not a Phase 1 role name. It is granted by the membership row.

---

# 4. What this approval starts

These decisions are approved, including the copied probabilities, tax rows, and credit formula. `@supercore/crm` and `@supercore/b2b` implement them. They do not import each other or `@supercore/commerce`. The API composes quote conversion. Frappe, ERPNext, and Vendure are not runtimes.
