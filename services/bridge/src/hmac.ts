import { createHmac, timingSafeEqual } from 'node:crypto';

export function signBody(secret: string, rawBody: string): string {
  return createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
}

export function verifySignature(secret: string, rawBody: string, header: string | undefined): boolean {
  if (!header) {
    return false;
  }
  const expected = Buffer.from(signBody(secret, rawBody), 'utf8');
  const actual = Buffer.from(header, 'utf8');
  if (expected.length !== actual.length) {
    return false;
  }
  return timingSafeEqual(expected, actual);
}
