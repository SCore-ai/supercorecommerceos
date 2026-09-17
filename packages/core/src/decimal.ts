import { Decimal } from 'decimal.js';
import { ValidationError } from './errors.js';

/**
 * Phase 0 money strategy. No accounting, tax, or rounding business rules.
 *
 * PostgreSQL: numeric(19, 4)
 * TypeScript: decimal.js Decimal
 * JSON/API: string
 * JS number is rejected.
 */
export const MONEY_PRECISION = 19;
export const MONEY_SCALE = 4;
export const CURRENCY_CODE_LENGTH = 3;

Decimal.set({
  precision: 40,
  rounding: Decimal.ROUND_HALF_EVEN,
});

export type MoneyDecimal = Decimal;

const moneyPattern = /^-?\d+(\.\d+)?$/;

export function parseMoney(value: string): MoneyDecimal {
  if (typeof value !== 'string' || value.trim() === '' || !moneyPattern.test(value)) {
    throw new ValidationError('Money values must be decimal strings');
  }
  return new Decimal(value);
}

export function serializeMoney(value: MoneyDecimal): string {
  return value.toFixed(MONEY_SCALE);
}

export function assertNotJsNumber(value: unknown): void {
  if (typeof value === 'number') {
    throw new ValidationError('JavaScript numbers cannot be used for financial amounts');
  }
}

export type CurrencyCode = string;

export function isCurrencyCode(value: string): boolean {
  return /^[A-Z]{3}$/.test(value);
}
