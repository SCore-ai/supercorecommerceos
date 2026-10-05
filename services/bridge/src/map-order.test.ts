import { describe, expect, it } from 'vitest';
import { toFrappeDocuments } from './map-order.js';

describe('Vendure order → Frappe Sales Invoice', () => {
  it('maps sku, qty, and unit price strings without computing tax', () => {
    const docs = toFrappeDocuments(
      {
        id: 'ord_1',
        code: 'T6YEH8',
        currencyCode: 'GBP',
        customer: { emailAddress: 'buyer@example.com', firstName: 'Ada', lastName: 'Lovelace' },
        lines: [{ sku: 'OXF-1', name: 'Oxford', quantity: 2, unitPrice: '12.5000', lineTotal: '25.0000' }],
      },
      '2026-10-05',
    );
    expect(docs.customer.email_id).toBe('buyer@example.com');
    expect(docs.invoice.customer).toBe('Ada Lovelace');
    expect(docs.invoice.currency).toBe('GBP');
    expect(docs.invoice.items).toEqual([{ item_code: 'OXF-1', qty: 2, rate: '12.5000' }]);
    expect(docs.invoice.remarks).toContain('T6YEH8');
  });
});
