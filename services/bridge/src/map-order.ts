import type { VendureOrderPayload } from './payload.js';

export type FrappeCustomer = {
  doctype: 'Customer';
  customer_name: string;
  customer_type: 'Individual';
  email_id: string;
};

export type FrappeSalesInvoice = {
  doctype: 'Sales Invoice';
  customer: string;
  currency: string;
  posting_date: string;
  items: Array<{ item_code: string; qty: number; rate: string }>;
  remarks: string;
};

export function customerName(order: VendureOrderPayload): string {
  const first = order.customer?.firstName?.trim() ?? '';
  const last = order.customer?.lastName?.trim() ?? '';
  const combined = `${first} ${last}`.trim();
  return combined || order.customer?.emailAddress || order.code;
}

export function toFrappeDocuments(order: VendureOrderPayload, postingDate: string): {
  customer: FrappeCustomer;
  invoice: FrappeSalesInvoice;
} {
  const email = order.customer?.emailAddress?.trim() || `order-${order.code}@invalid.local`;
  const customer = customerName(order);
  return {
    customer: {
      doctype: 'Customer',
      customer_name: customer,
      customer_type: 'Individual',
      email_id: email,
    },
    invoice: {
      doctype: 'Sales Invoice',
      customer,
      currency: order.currencyCode,
      posting_date: postingDate,
      items: order.lines.map((line) => ({
        item_code: line.sku,
        qty: line.quantity,
        rate: line.unitPrice,
      })),
      remarks: `Vendure order ${order.code} (${order.id})`,
    },
  };
}
