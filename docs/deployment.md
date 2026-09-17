# Deployment

Phase 0 does not deploy to production.

CI runs on GitHub Actions: install, lint, typecheck, unit tests, migrate, integration tests, build.

NGINX configuration in `infrastructure/nginx/nginx.conf` is a placeholder. Production domain, TLS, ports, and topology are not decided.

Keep production deployment approval-gated when that work begins.
