/**
 * Payments domain boundary. Capture with Phase 2 orders. Allocation with Phase 5 accounting.
 * No live gateway in Phase 0–1. Processor IDs are never canonical PKs.
 */
export const PAYMENTS_PACKAGE = '@supercore/payments' as const;
