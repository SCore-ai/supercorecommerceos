import { getDb } from './client.js';
import { countries, currencies } from './schema.js';
import { createInternalId } from '../ids.js';
import { ISO_3166_1_COUNTRIES, ISO_4217_CURRENCIES } from '../reference-data.js';

export async function seedReferenceData(): Promise<void> {
  const db = getDb();
  const existingCountries = await db.select({ isoAlpha2: countries.isoAlpha2 }).from(countries);
  const knownCountries = new Set(existingCountries.map((row) => row.isoAlpha2));
  const countryRows = ISO_3166_1_COUNTRIES.filter((row) => !knownCountries.has(row.isoAlpha2)).map((row) => ({
    id: createInternalId(),
    isoAlpha2: row.isoAlpha2,
    isoAlpha3: row.isoAlpha3,
    name: row.name,
    isActive: true,
  }));
  if (countryRows.length > 0) {
    await db.insert(countries).values(countryRows);
  }

  const existingCurrencies = await db.select({ code: currencies.code }).from(currencies);
  const knownCodes = new Set(existingCurrencies.map((row) => row.code));
  const currencyRows = ISO_4217_CURRENCIES.filter((row) => !knownCodes.has(row.code)).map((row) => ({
    id: createInternalId(),
    code: row.code,
    name: row.name,
    minorUnit: row.minorUnit,
    isActive: true,
  }));
  if (currencyRows.length > 0) {
    await db.insert(currencies).values(currencyRows);
  }
}
