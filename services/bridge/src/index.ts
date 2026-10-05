import { createServer } from 'node:http';
import { handleVendureOrderWebhook } from './handle.js';

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

const port = Number(process.env.BRIDGE_PORT ?? '4010');
const webhookSecret = requireEnv('VENDURE_WEBHOOK_SECRET');
const frappe = {
  url: requireEnv('FRAPPE_URL'),
  apiKey: requireEnv('FRAPPE_API_KEY'),
  apiSecret: requireEnv('FRAPPE_API_SECRET'),
};

const server = createServer((req, res) => {
  void (async () => {
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'bridge' }));
      return;
    }
    if (req.method !== 'POST' || req.url !== '/webhooks/vendure/order') {
      res.writeHead(404);
      res.end();
      return;
    }
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk as Buffer);
    }
    const rawBody = Buffer.concat(chunks).toString('utf8');
    const signature = req.headers['x-webhook-signature'];
    const result = await handleVendureOrderWebhook({
      rawBody,
      signature: Array.isArray(signature) ? signature[0] : signature,
      webhookSecret,
      frappe,
      postingDate: new Date().toISOString().slice(0, 10),
    });
    res.writeHead(result.status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(result.body));
  })().catch((error: unknown) => {
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Bridge failed' }));
  });
});

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`bridge listening on 127.0.0.1:${port}\n`);
});
