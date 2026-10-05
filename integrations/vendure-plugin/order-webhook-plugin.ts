/**
 * Drop this file into YOUR Vendure server (not compiled by this repo).
 *
 * Listens to OrderStateTransitionEvent and POSTs JSON to the Supercore bridge.
 * Event shape: references/vendure/packages/core/src/event-bus/events/order-state-transition-event.ts
 *
 * Register: `plugins: [SupercoreOrderWebhookPlugin.init({ bridgeUrl, secret })]`
 */
import { createHmac } from 'node:crypto';
import { EventBus, OrderStateTransitionEvent, PluginCommonModule, VendurePlugin } from '@vendure/core';
import { OnApplicationBootstrap } from '@nestjs/common';

export type SupercoreOrderWebhookOptions = {
  bridgeUrl: string;
  secret: string;
};

@VendurePlugin({
  imports: [PluginCommonModule],
})
export class SupercoreOrderWebhookPlugin implements OnApplicationBootstrap {
  private static options: SupercoreOrderWebhookOptions;

  static init(options: SupercoreOrderWebhookOptions) {
    this.options = options;
    return this;
  }

  constructor(private eventBus: EventBus) {}

  onApplicationBootstrap() {
    const options = SupercoreOrderWebhookPlugin.options;
    this.eventBus.ofType(OrderStateTransitionEvent).subscribe((event) => {
      void postBridge(options, event);
    });
  }
}

async function postBridge(options: SupercoreOrderWebhookOptions, event: OrderStateTransitionEvent) {
  const order = event.order;
  const body = JSON.stringify({
    fromState: event.fromState,
    toState: event.toState,
    order: {
      id: String(order.id),
      code: order.code,
      currencyCode: order.currencyCode,
      customer: order.customer
        ? {
            emailAddress: order.customer.emailAddress,
            firstName: order.customer.firstName,
            lastName: order.customer.lastName,
          }
        : undefined,
      lines: (order.lines ?? []).map((line) => ({
        sku: line.productVariant?.sku ?? '',
        name: line.productVariant?.name,
        quantity: line.quantity,
        unitPrice: String(line.proratedUnitPriceWithTax ?? line.unitPriceWithTax ?? ''),
        lineTotal: String(line.proratedLinePriceWithTax ?? line.linePriceWithTax ?? ''),
      })),
    },
  });
  const signature = createHmac('sha256', options.secret).update(body, 'utf8').digest('hex');
  await fetch(`${options.bridgeUrl.replace(/\/$/, '')}/webhooks/vendure/order`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-webhook-signature': signature },
    body,
  });
}
