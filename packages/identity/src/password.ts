import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { ValidationError } from '@supercore/core';

export const SCRYPT_N = 16384;
export const SCRYPT_R = 8;
export const SCRYPT_P = 1;
export const SCRYPT_KEYLEN = 64;
const SALT_BYTES = 16;
const MIN_PASSWORD = 12;
const MAX_PASSWORD = 128;

function scryptHash(password: string, salt: Buffer, keylen: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P }, (error, derived) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derived);
    });
  });
}

export function assertPasswordPolicy(plaintext: string): void {
  if (plaintext.length < MIN_PASSWORD || plaintext.length > MAX_PASSWORD) {
    throw new ValidationError('Password must be between 12 and 128 characters');
  }
}

export async function hashPassword(plaintext: string): Promise<string> {
  assertPasswordPolicy(plaintext);
  const salt = randomBytes(SALT_BYTES);
  const key = await scryptHash(plaintext, salt, SCRYPT_KEYLEN);
  return `${salt.toString('base64url')}.${key.toString('base64url')}`;
}

export async function verifyPassword(plaintext: string, stored: string): Promise<boolean> {
  const [saltB64, keyB64] = stored.split('.');
  if (!saltB64 || !keyB64) {
    return false;
  }
  const salt = Buffer.from(saltB64, 'base64url');
  const expected = Buffer.from(keyB64, 'base64url');
  const actual = await scryptHash(plaintext, salt, expected.length);
  if (actual.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(actual, expected);
}

let dummyHashPromise: Promise<string> | undefined;

async function dummyHash(): Promise<string> {
  dummyHashPromise ??= hashPassword('not-a-real-user-password-xx');
  return dummyHashPromise;
}

export async function dummyPasswordCheck(plaintext: string): Promise<void> {
  const stored = await dummyHash();
  await verifyPassword(plaintext, stored);
}

export function createInvitationSecret(): { secret: string; hash: string } {
  const secret = randomBytes(32).toString('base64url');
  return { secret, hash: hashInvitationSecret(secret) };
}

export function hashInvitationSecret(secret: string): string {
  return createHash('sha256').update(secret, 'utf8').digest('hex');
}
