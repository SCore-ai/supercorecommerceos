import { describe, expect, it } from 'vitest';
import { handleVendureOrderWebhook } from './handle.js';
import { signBody } from './hmac.js';
import type { VendureOrderWebhook } from './payload.js';

const secret = 'bridge-secret';
const frappe = { url: 'http://frappe.local', apiKey: 'k', apiSecret: 's' };

function settled(): VendureOrderWebhook {
  return {
    fromState: 'ArrangingPayment',
    toState: 'PaymentSettled',
    order: {
      id: '1',
      code: 'ABC123',
      currencyCode: 'GBP',
      customer: { emailAddress: 'a@b.c', firstName: 'A', lastName: 'B' },
      lines: [{ sku: 'SKU-1', quantity: 1, unitPrice: '10.0000', lineTotal: '10.0000' }],
    },
  };
}

describe('handleVendureOrderWebhook', () => {
  it('rejects a bad signature', async () => {
    const rawBody = JSON.stringify(settled());
    const result = await handleVendureOrderWebhook({
      rawBody,
      signature: 'nope',
      webhookSecret: secret,
      frappe,
      postingDate: '2026-10-05',
    });
    expect(result.status).toBe(401);
  });

  it('ignores non-settled transitions', async () => {
    const payload = { ...settled(), toState: 'AddingItems' };
    const rawBody = JSON.stringify(payload);
    const result = await handleVendureOrderWebhook({
      rawBody,
      signature: signBody(secret, rawBody),
      webhookSecret: secret,
      frappe,
      postingDate: '2026-10-05',
    });
    expect(result.status).toBe(202);
  });

  it('posts Customer then Sales Invoice when PaymentSettled', async () => {
    const calls: string[] = [];
    const rawBody = JSON.stringify(settled());
    const result = await handleVendureOrderWebhook({
      rawBody,
      signature: signBody(secret, rawBody),
      webhookSecret: secret,
      frappe,
      postingDate: '2026-10-05',
      postCustomer: async () => {
        calls.push('customer');
      },
      postInvoice: async () => {
        calls.push('invoice');
        return {};
      },
    });
    expect(result).toEqual({ status: 200, body: { ok: true, orderCode: 'ABC123' } });
    expect(calls).toEqual(['customer', 'invoice']);
  });
});
