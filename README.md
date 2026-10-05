# SUPERCORE — Headless Vendure + Frappe

Vendure, sepet ve ödemeyi yönetir. Frappe, stok ve muhasebeyi yönetir. Bu depo **motor değildir**; tamamlanan siparişi Frappe’ye taşıyan köprüdür.

**ADR-010** bağlayıcıdır. Eski P0–P2 modüler monolith uygulama kodu kaldırıldı.

## Runtimes (bu repo dışında)

1. [Vendure](https://github.com/vendure-ecommerce/vendure) — Shop/Admin GraphQL
2. Frappe / ERPNext — REST (`/api/resource/...`)
3. Bu repo — `services/bridge`

Karşılaştırma klonları (gitignored): `references/vendure`, `references/erpnext`, `references/frappe`. İçeri `import` yok.

## Köprü

Vendure `OrderStateTransitionEvent` (`toState === PaymentSettled`) bir HTTP POST gönderir:

`POST /webhooks/vendure/order`

İmza: `x-webhook-signature` = HMAC-SHA256(hex) of raw body with `VENDURE_WEBHOOK_SECRET`.

Köprü Frappe’de Customer (email ile) ve **Sales Invoice** yazar. Alan adları ERPNext Sales Invoice DocType ile hizalı (`customer`, `currency`, `items[].item_code|qty|rate`) — DocType kopyalanmaz; REST gövdesi map edilir.

Lookup: `references/vendure/packages/core/src/event-bus/events/order-state-transition-event.ts`  
Lookup: `references/erpnext/erpnext/accounts/doctype/sales_invoice/sales_invoice.json`

## Quick start

```bash
cp .env.example .env
pnpm install
pnpm --filter @supercore/bridge dev
```

Vendure projenize `integrations/vendure-plugin/order-webhook-plugin.ts` dosyasını ekleyin (Vendure kendi sürecinde derler).
