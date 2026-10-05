import { createSalesInvoice, ensureCustomer, type FrappeConfig } from './frappe.js';
import { verifySignature } from './hmac.js';
import { toFrappeDocuments } from './map-order.js';
import { isSettledTransition, type VendureOrderWebhook } from './payload.js';

export type HandleResult =
  | { status: number; body: { ignored: true; reason: string } }
  | { status: number; body: { ok: true; orderCode: string } }
  | { status: number; body: { error: string } };

export async function handleVendureOrderWebhook(input: {
  rawBody: string;
  signature: string | undefined;
  webhookSecret: string;
  frappe: FrappeConfig;
  postingDate: string;
  postInvoice?: typeof createSalesInvoice;
  postCustomer?: typeof ensureCustomer;
}): Promise<HandleResult> {
  if (!verifySignature(input.webhookSecret, input.rawBody, input.signature)) {
    return { status: 401, body: { error: 'Invalid webhook signature' } };
  }
  let payload: VendureOrderWebhook;
  try {
    payload = JSON.parse(input.rawBody) as VendureOrderWebhook;
  } catch {
    return { status: 400, body: { error: 'Invalid JSON' } };
  }
  if (!payload?.order?.code || !Array.isArray(payload.order.lines)) {
    return { status: 400, body: { error: 'Order payload required' } };
  }
  if (!isSettledTransition(payload)) {
    return { status: 202, body: { ignored: true, reason: `state ${payload.toState}` } };
  }
  const docs = toFrappeDocuments(payload.order, input.postingDate);
  const ensure = input.postCustomer ?? ensureCustomer;
  const invoice = input.postInvoice ?? createSalesInvoice;
  await ensure(input.frappe, docs.customer.customer_name, docs.customer);
  await invoice(input.frappe, docs.invoice);
  return { status: 200, body: { ok: true, orderCode: payload.order.code } };
}
