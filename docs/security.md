# Security

Phase 0 baseline, not a certification.

Implemented:

- environment validation
- secret isolation (`.env` gitignored)
- structured log redaction
- safe API error payloads
- HTTP security headers
- CORS allowlist with credentials
- Origin check on cookie-authenticated mutations
- in-memory rate-limit abstraction
- Zod input/env validation
- secure cookie option helpers (httpOnly, 12h session)
- webhook verification interface
- tenant IDs are never trusted from the client
- first-party email/password sessions (Phase 1)
- scrypt password hashing (N=16384, r=8, p=1, keylen=64)
- production dependency audit script

Not implemented:

- MFA / OAuth / password-reset mail
- certified compliance controls
- HMRC or payment-provider security reviews
