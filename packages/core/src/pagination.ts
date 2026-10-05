import { ValidationError } from './errors.js';

export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

export type PageInput = {
  limit?: number;
  offset?: number;
};

export type Page<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

export function parsePage(input: PageInput = {}): { limit: number; offset: number } {
  const limit = input.limit ?? DEFAULT_PAGE_LIMIT;
  const offset = input.offset ?? 0;
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_LIMIT) {
    throw new ValidationError('limit must be an integer between 1 and 100');
  }
  if (!Number.isInteger(offset) || offset < 0) {
    throw new ValidationError('offset must be a non-negative integer');
  }
  return { limit, offset };
}
