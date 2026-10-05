# Security

The bridge verifies Vendure webhooks before calling Frappe.

- `x-webhook-signature`: HMAC-SHA256 hex of the **raw** body with `VENDURE_WEBHOOK_SECRET`
- Compare with `crypto.timingSafeEqual`
- Frappe REST uses token `api_key:api_secret` from environment
- Never commit `.env`
- Do not skip signature checks

Secrets: `VENDURE_WEBHOOK_SECRET`, `FRAPPE_API_KEY`, `FRAPPE_API_SECRET`.
