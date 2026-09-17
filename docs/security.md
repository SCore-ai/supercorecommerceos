# Security

Phase 0 baseline, not a certification.

Implemented:

- environment validation
- secret isolation (`.env` gitignored)
- structured log redaction
- safe API error payloads
- HTTP security headers
- CORS allowlist
- in-memory rate-limit abstraction
- Zod input/env validation
- secure cookie option helpers
- webhook verification interface
- tenant IDs are never trusted from the client
- production dependency audit script

Not implemented:

- full authentication product
- certified compliance controls
- HMRC or payment-provider security reviews
