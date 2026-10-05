export type VendureOrderLine = {
  sku: string;
  name?: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
};

export type VendureOrderPayload = {
  id: string;
  code: string;
  currencyCode: string;
  customer?: {
    emailAddress?: string;
    firstName?: string;
    lastName?: string;
  };
  lines: VendureOrderLine[];
};

export type VendureOrderWebhook = {
  fromState: string;
  toState: string;
  order: VendureOrderPayload;
};

export const SETTLED_STATE = 'PaymentSettled';

export function isSettledTransition(body: VendureOrderWebhook): boolean {
  return body.toState === SETTLED_STATE;
}
