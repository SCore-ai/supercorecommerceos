import { v7 as uuidv7, validate as uuidValidate, version as uuidVersion } from 'uuid';

/**
 * Internal database primary keys are UUIDv7.
 * Business identifiers are a separate abstraction and must never be used as PKs.
 */
export function createInternalId(): string {
  return uuidv7();
}

export function isInternalId(value: string): boolean {
  return uuidValidate(value) && uuidVersion(value) === 7;
}

export type BusinessId = string;

export type EntityIdentity = {
  id: string;
  businessId: BusinessId | null;
};

/**
 * Business numbering rules are intentionally unimplemented in Phase 0.
 * Future phases will assign business IDs without replacing the internal PK.
 */
export function createUnassignedIdentity(): EntityIdentity {
  return {
    id: createInternalId(),
    businessId: null,
  };
}
