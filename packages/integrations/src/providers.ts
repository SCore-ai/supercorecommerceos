/**
 * External IDs are never canonical Supercore identifiers.
 * Adapters translate provider records into Supercore-owned identities.
 */
export type ExternalReference = {
  provider: string;
  externalId: string;
};

export interface CommerceProvider {
  readonly name: string;
}

export interface AccountingProvider {
  readonly name: string;
}

export interface CRMProvider {
  readonly name: string;
}

export interface PaymentProvider {
  readonly name: string;
}

export interface ShippingProvider {
  readonly name: string;
}

export interface AIProvider {
  readonly name: string;
}

export interface TaxProvider {
  readonly name: string;
}

export interface HMRCProvider {
  readonly name: string;
}

export interface VATReturnProvider {
  readonly name: string;
}

export class UnimplementedProviderError extends Error {
  constructor(provider: string) {
    super(`${provider} is an interface boundary only in Phase 0`);
    this.name = 'UnimplementedProviderError';
  }
}
