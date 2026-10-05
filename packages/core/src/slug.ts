import { ValidationError } from './errors.js';

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])$/;

export function normalizeTenantSlug(value: string): string {
  return value.trim().toLowerCase();
}

export function parseTenantSlug(value: unknown): string {
  if (typeof value !== 'string') {
    throw new ValidationError('tenantSlug is required');
  }
  const slug = normalizeTenantSlug(value);
  if (slug.length < 3 || slug.length > 63 || !SLUG_PATTERN.test(slug)) {
    throw new ValidationError('tenantSlug must be 3–63 characters: lowercase letters, digits, and internal hyphens');
  }
  return slug;
}

export function isTenantSlug(value: string): boolean {
  const slug = normalizeTenantSlug(value);
  return slug.length >= 3 && slug.length <= 63 && SLUG_PATTERN.test(slug);
}
