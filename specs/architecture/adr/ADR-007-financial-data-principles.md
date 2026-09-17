# ADR-007 Financial data principles

## Context

Accounting is not implemented in Phase 0, but JavaScript numbers are unsafe for money.

## Decision

- PostgreSQL stores monetary amounts as `numeric(19, 4)` unless a later accounting spec changes scale per currency.
- Currency is an explicit ISO-4217 string, never implied.
- TypeScript uses `decimal.js` `Decimal`.
- JSON/GraphQL serialization uses decimal strings.
- JavaScript `number` is rejected for money.
- Default rounding in the library is half-even. Actual accounting/tax rounding rules are not defined here.
- Posted financial records will be immutable when that domain exists. Phase 0 does not create ledger tables.

## Alternatives

- `float`/`double`: rejected
- integer minor units only: possible later, but `numeric` is clearer as the default column type
- `bigint` cents globally: awkward for currencies with non-2 exponents

## Consequences

Accounting Phase must follow this strategy or replace it with a new ADR before writing ledger code. Do not invent VAT or invoice rules in Phase 0.
