export type FrappeConfig = {
  url: string;
  apiKey: string;
  apiSecret: string;
};

async function frappeRequest(
  config: FrappeConfig,
  method: string,
  path: string,
  body?: unknown,
): Promise<{ ok: boolean; status: number; json: unknown }> {
  const response = await fetch(`${config.url.replace(/\/$/, '')}${path}`, {
    method,
    headers: {
      authorization: `token ${config.apiKey}:${config.apiSecret}`,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json: unknown = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, json };
}

export async function ensureCustomer(
  config: FrappeConfig,
  customerName: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const existing = await frappeRequest(
    config,
    'GET',
    `/api/resource/Customer/${encodeURIComponent(customerName)}`,
  );
  if (existing.ok) {
    return;
  }
  const created = await frappeRequest(config, 'POST', '/api/resource/Customer', payload);
  if (!created.ok && created.status !== 409) {
    throw new Error(`Frappe Customer failed: ${created.status} ${JSON.stringify(created.json)}`);
  }
}

export async function createSalesInvoice(
  config: FrappeConfig,
  payload: Record<string, unknown>,
): Promise<unknown> {
  const created = await frappeRequest(config, 'POST', '/api/resource/Sales Invoice', payload);
  if (!created.ok) {
    throw new Error(`Frappe Sales Invoice failed: ${created.status} ${JSON.stringify(created.json)}`);
  }
  return created.json;
}
