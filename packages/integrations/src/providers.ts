/**
 * External IDs are never canonical Supercore identifiers.
 * Adapters translate provider records into Supercore-owned identities.
 *
 * Canonical implementations (later phases, still Supercore-owned):
 *   SupercoreCommerceProvider, SupercoreCRMProvider,
 *   SupercoreAccountingProvider, SupercoreTaxProvider
 *
 * Optional unscheduled adapters (not installed in Phase 0–1, no dedicated phase):
 *   VendureCommerceProvider, FrappeCRMProvider, ERPNextAccountingProvider
 */
export type ExternalReference = {
  provider: string;
  externalId: string;
};

/** Canonical later: SupercoreCommerceProvider. Optional unscheduled: VendureCommerceProvider. */
export interface CommerceProvider {
  readonly name: string;
}

/** Canonical later: SupercoreAccountingProvider. Optional unscheduled: ERPNextAccountingProvider. */
export interface AccountingProvider {
  readonly name: string;
}

/** Canonical later: SupercoreCRMProvider. Optional unscheduled: FrappeCRMProvider. */
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

/** Canonical later: SupercoreTaxProvider. HMRC remains an adapter with an approval gate. */
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
