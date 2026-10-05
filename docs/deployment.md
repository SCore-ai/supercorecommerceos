# Deployment

This repository ships the webhook bridge only. Vendure and Frappe have their own deploy processes.

CI (GitHub Actions): install, lint, typecheck, tests, build.

Do not expose the webhook without HMAC. Keep Frappe API keys off the storefront.
