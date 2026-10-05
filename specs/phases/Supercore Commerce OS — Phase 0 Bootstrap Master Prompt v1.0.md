# SUPERCORE COMMERCE OS
## PHASE 0 — BOOTSTRAP MASTER PROMPT v1.0

You are the principal software architect and senior staff engineer responsible for bootstrapping the Supercore Commerce OS codebase.

Your task is to create the production-grade technical foundation of Supercore Commerce OS.

This is NOT a prototype.
This is NOT a throwaway scaffold.
This repository will become the foundation of the future Supercore Commerce OS / Business OS.

The architecture must therefore prioritize:

- correctness
- maintainability
- security
- type safety
- modularity
- testability
- observability
- AI-agent friendliness
- future multi-tenancy
- future SaaS operation
- replaceable external engines
- clean domain boundaries

Do not rush into implementing business features.

PHASE 0 is ONLY the platform/bootstrap foundation.

---

# 1. PRODUCT VISION

Supercore Commerce OS will ultimately contain:

- Commerce
- B2B Commerce
- CRM
- ERP
- Accounting
- Inventory
- Procurement
- Tax / VAT
- Payments
- AI
- Identity
- Reporting
- Workflow
- Integrations

The final system must be owned by Supercore.

External systems such as Vendure, ERPNext, Frappe CRM, HMRC, payment providers, shipping providers and supplier APIs must remain replaceable integrations.

The canonical domain model belongs to Supercore.

---

# 2. CORE ARCHITECTURAL PRINCIPLE

Use this architecture:

Human/Product Requirement
        ↓
Specification
        ↓
Domain Model
        ↓
Application Layer
        ↓
API
        ↓
Infrastructure
        ↓
Database

External systems:

Supercore Domain
        ↓
Adapter Interface
        ↓
External Provider

Never allow external providers to become the owner of Supercore business logic.

---

# 3. TECHNOLOGY STACK

Use:

- TypeScript
- Node.js
- Next.js
- PostgreSQL
- Drizzle ORM
- Redis
- BullMQ
- GraphQL
- REST where appropriate
- Tailwind CSS
- shadcn/ui
- Vitest
- Playwright
- Docker
- Docker Compose
- NGINX
- GitHub Actions

Use a modern stable Node.js LTS version.

Before installing packages, inspect current package compatibility and select versions that work together reliably.

Do NOT blindly use latest versions if compatibility is uncertain.

Prefer stable, well-supported versions.

---

# 4. ARCHITECTURE STYLE

Use:

MODULAR MONOLITH FIRST.

Do NOT create microservices during Phase 0.

The code must nevertheless have strong module boundaries so that individual modules can later become independent services.

Initial architecture:

apps/
packages/
services/

Business domains must be isolated.

---

# 5. REPOSITORY STRUCTURE

Create:

supercore-commerce-os/

├── apps/
│   ├── web/
│   ├── admin/
│   └── api/
│
├── packages/
│   ├── core/
│   ├── commerce/
│   ├── b2b/
│   ├── crm/
│   ├── accounting/
│   ├── inventory/
│   ├── procurement/
│   ├── tax/
│   ├── payments/
│   ├── identity/
│   ├── ai/
│   ├── events/
│   ├── search/
│   ├── files/
│   └── integrations/
│
├── services/
│   ├── worker/
│   ├── integration/
│   └── ai/
│
├── infrastructure/
│   ├── docker/
│   ├── nginx/
│   ├── postgres/
│   └── redis/
│
├── specs/
│   ├── architecture/
│   ├── commerce/
│   ├── b2b/
│   ├── crm/
│   ├── accounting/
│   ├── inventory/
│   ├── procurement/
│   ├── tax/
│   ├── payments/
│   └── ai/
│
├── tests/
│
├── docs/
│
├── scripts/
│
├── .github/
│   └── workflows/
│
├── AGENTS.md
├── README.md
├── docker-compose.yml
├── package.json
└── pnpm-workspace.yaml

Use a monorepo.

Prefer pnpm workspaces.

Use Turborepo only if it provides a clear benefit without unnecessary complexity.

Do not introduce infrastructure merely because it is fashionable.

---

# 6. PHASE 0 OBJECTIVES

At the end of Phase 0, the repository must have:

1. Git repository initialized
2. Monorepo working
3. TypeScript configured
4. Next.js application running
5. API application running
6. Admin application scaffolded
7. PostgreSQL running through Docker
8. Redis running through Docker
9. Drizzle configured
10. Database migration mechanism working
11. GraphQL endpoint scaffolded
12. REST health endpoint working
13. Redis connectivity tested
14. Background worker scaffolded
15. Event system foundation scaffolded
16. Environment configuration implemented
17. Logging foundation implemented
18. Error handling foundation implemented
19. Validation foundation implemented
20. Testing infrastructure working
21. Playwright scaffolded
22. CI pipeline working
23. Security baseline implemented
24. AGENTS.md created
25. Architecture specifications created
26. ADR system created
27. README created
28. Local development instructions documented

Do not implement full Commerce, CRM, Accounting or ERP logic yet.

---

# 7. DOMAIN BOUNDARIES

Create empty but properly structured module boundaries for:

packages/core
packages/commerce
packages/b2b
packages/crm
packages/accounting
packages/inventory
packages/procurement
packages/tax
packages/payments
packages/identity
packages/ai
packages/events
packages/search
packages/files
packages/integrations

Each module must have a clear purpose.

Do not allow arbitrary cross-module imports.

Document intended dependencies.

---

# 8. CORE PLATFORM MODULE

The core module will eventually contain:

- Tenant
- Organization
- User
- Role
- Permission
- Address
- Country
- Currency
- Audit
- Configuration
- Feature flags

For Phase 0, create only the foundational structure.

Do not implement complex business logic.

---

# 9. MULTI-TENANCY

The final product will be a multi-tenant SaaS.

Therefore the architecture must be tenant-aware from Day 1.

Design domain entities so they can contain:

tenantId

Do not implement insecure global queries.

The application layer must be designed so tenant context is explicit.

Never trust tenantId supplied directly by an untrusted client.

Tenant context must eventually come from authenticated identity/session/token.

For Phase 0 create the tenant abstraction and context mechanism.

---

# 10. DATABASE

Use PostgreSQL.

Use Drizzle ORM.

Create a clean database configuration.

Create migration support.

Create separate development/test database configuration where practical.

Do not use database synchronization as the production migration mechanism.

Use migrations.

Never silently alter schema.

Every schema change must produce a migration.

---

# 11. DATABASE RULES

The following rules are mandatory:

- No direct frontend database access.
- No raw SQL unless justified.
- Parameterize SQL.
- No destructive migration without explicit approval.
- Never delete financial data.
- Use timestamps consistently.
- Prefer UTC internally.
- Store currency explicitly.
- Store monetary values safely.
- Do not use JavaScript floating point for financial calculations.
- Establish a Decimal strategy before implementing financial domains.
- Primary keys must be Supercore-owned.
- External provider IDs must never become canonical primary keys.

---

# 12. ID STRATEGY

Supercore owns canonical identifiers.

Examples:

SC-CUS-000001
SC-PRO-000001
SC-ORD-000001
SC-INV-000001
SC-PAY-000001

However, do not hard-code sequential business IDs directly into database implementation without evaluating scalability and concurrency.

Create an ID abstraction.

Internal database primary keys may use UUID/UUIDv7 or another robust strategy.

Business identifiers are separate from internal database IDs.

External identifiers are stored separately.

Example:

Customer:

id
businessId
tenantId
vendureId
erpnextId

The canonical Supercore identity remains independent from external systems.

---

# 13. EXTERNAL INTEGRATION ARCHITECTURE

Create provider interfaces.

Example:

CommerceProvider

Methods may eventually include:

- createProduct
- updateProduct
- createCustomer
- createOrder
- getOrder
- updateStock

AccountingProvider

Methods may eventually include:

- createInvoice
- postJournal
- recordPayment
- reconcileBank
- getLedger

CRMProvider

Methods may eventually include:

- createLead
- createAccount
- createOpportunity
- createActivity

Phase 0 should define interfaces and integration boundaries.

Do not implement complete Vendure or ERPNext integrations yet.

Create placeholder adapters where useful.

---

# 14. EVENT SYSTEM

Create the foundation for domain events.

Example events:

- CustomerCreated
- ProductCreated
- OrderPlaced
- PaymentCaptured
- InvoicePosted
- StockAdjusted
- OpportunityCreated

Phase 0 should define:

DomainEvent interface
Event metadata
Event name
Event ID
Timestamp
Tenant ID
Aggregate ID
Correlation ID

Events must be traceable.

Do not implement a complicated distributed event bus.

Redis/BullMQ may be used for asynchronous jobs where appropriate.

---

# 15. API ARCHITECTURE

Create:

GraphQL endpoint

and:

REST health endpoint.

GraphQL should eventually become the primary application API for frontend/domain operations.

REST can be used for:

- health
- webhooks
- operational endpoints
- external integrations where appropriate

Never put business logic directly inside route handlers.

Use:

Controller/API
      ↓
Application Service
      ↓
Domain
      ↓
Repository
      ↓
Infrastructure

---

# 16. VALIDATION

Use a consistent schema validation strategy.

Zod is acceptable unless a better compatible solution is justified.

Validate:

- API inputs
- environment variables
- configuration
- external webhook payloads
- integration responses

Never trust external input.

---

# 17. ERROR HANDLING

Create a consistent application error model.

Examples:

ValidationError
AuthenticationError
AuthorizationError
NotFoundError
ConflictError
BusinessRuleError
IntegrationError
InfrastructureError

Do not expose stack traces or sensitive internal information to clients in production.

Errors must have:

- code
- message
- correlation ID
- optional metadata

---

# 18. LOGGING

Implement structured logging.

Every important operation should eventually support:

- timestamp
- level
- service
- tenant
- user
- request ID
- correlation ID
- operation
- duration

Do not log:

- passwords
- API keys
- tokens
- payment credentials
- sensitive secrets

---

# 19. ENVIRONMENT CONFIGURATION

Create:

.env.example

Never commit:

.env

or secrets.

Environment configuration must be validated on startup.

At minimum:

DATABASE_URL
REDIS_URL
NODE_ENV
API_URL
WEB_URL

Prepare placeholders for future:

OPENAI_API_KEY
HMRC credentials
payment provider credentials
S3 credentials
external integrations

Do not add real secrets.

---

# 20. AUTHENTICATION FOUNDATION

Phase 0 should create the authentication boundary but not attempt to build the complete identity system.

Create interfaces such as:

AuthProvider
Session
CurrentUser
TenantContext

The final system may later use Supercore Identity.

Do not tightly couple the architecture to a third-party identity provider.

---

# 21. AUTHORIZATION

Prepare:

RBAC

Roles:

- Super Admin
- Tenant Admin
- Manager
- Sales
- Finance
- Procurement
- Warehouse
- Support
- Viewer

Do not implement every permission now.

Create the permission model and enforcement boundary.

---

# 22. AUDIT FOUNDATION

Create an audit architecture.

Future audit records should capture:

- actor
- tenant
- action
- entity
- entity ID
- timestamp
- old value where appropriate
- new value where appropriate
- IP/device metadata where legally appropriate
- correlation ID

Financial audit requirements will be expanded later.

---

# 23. SECURITY BASELINE

Implement reasonable production security defaults.

At minimum:

- secure HTTP headers
- input validation
- CORS configuration
- rate-limit abstraction
- secure cookie strategy
- secret isolation
- webhook verification abstraction
- no secrets in logs
- dependency audit
- static type checking
- linting
- security-oriented tests

Do not implement fake security.

If a security feature cannot safely be implemented in Phase 0, create a documented abstraction/TODO rather than pretending it is complete.

---

# 24. FRONTEND

Create the Next.js web application.

Requirements:

- TypeScript
- Tailwind
- shadcn/ui foundation
- responsive layout
- basic navigation
- API client abstraction
- authentication boundary
- error boundary
- loading states

Do not build full storefront functionality yet.

Create a clean Supercore dashboard shell.

---

# 25. ADMIN

Create a separate admin application or a clearly isolated admin route architecture.

It must eventually support:

- tenant management
- users
- roles
- products
- orders
- customers
- CRM
- accounting
- reports

Phase 0 only needs the shell.

---

# 26. WORKER

Create:

services/worker

using BullMQ/Redis.

Create a test job.

Example:

system.health.check

The worker must be independently runnable.

---

# 27. SEARCH

Create:

packages/search

with an interface such as:

SearchProvider

Do not install OpenSearch unless required.

A future implementation may use:

Meilisearch
or
OpenSearch

The application must not depend directly on a specific search engine.

---

# 28. FILE STORAGE

Create:

packages/files

with:

FileStorageProvider

Future implementation:

S3-compatible storage.

Do not tightly couple the domain to local filesystem storage.

---

# 29. TESTING

Testing is mandatory from Phase 0.

Create:

Unit tests
Integration tests
API tests
Database tests where appropriate
E2E test foundation

At minimum, create tests proving:

1. API health endpoint works.
2. PostgreSQL connection works.
3. Redis connection works.
4. GraphQL endpoint responds.
5. Validation works.
6. Error handling works.
7. Worker can process a test job.
8. Tenant context abstraction works.
9. Environment validation works.
10. CI test suite passes.

---

# 30. CI/CD

Create GitHub Actions workflow.

On pull request:

- install dependencies
- typecheck
- lint
- unit tests
- integration tests
- build

Do not deploy production automatically in Phase 0.

Create the deployment architecture but keep production deployment approval-gated.

---

# 31. DOCUMENTATION

Create:

README.md

docs/

specs/

and:

docs/development.md
docs/architecture.md
docs/database.md
docs/testing.md
docs/security.md
docs/deployment.md

Every architectural decision must be documented.

---

# 32. ADR SYSTEM

Create:

specs/architecture/adr/

Create initial ADRs:

ADR-001-modular-monolith.md
ADR-002-canonical-data-ownership.md
ADR-003-id-strategy.md
ADR-004-adapter-architecture.md
ADR-005-api-architecture.md
ADR-006-multi-tenancy.md
ADR-007-financial-data-principles.md
ADR-008-ai-development-principles.md

Each ADR should contain:

Context
Decision
Alternatives
Consequences

---

# 33. AGENTS.MD

Create a comprehensive AGENTS.md.

The following rules are mandatory:

1. Read /specs before implementing domain functionality.
2. Never invent business rules.
3. Never change architecture silently.
4. Architecture changes require an ADR.
5. Database changes require migrations.
6. Never delete financial records.
7. Posted financial transactions are immutable.
8. Financial entries must balance.
9. No business logic in frontend.
10. No direct database access from frontend.
11. External systems use adapters.
12. External IDs are never canonical IDs.
13. All financial changes require audit trails.
14. Never commit secrets.
15. Never bypass validation.
16. AI cannot bypass domain rules.
17. AI cannot autonomously submit HMRC filings without explicit approval.
18. Never introduce microservices without an ADR.
19. Every feature requires tests.
20. Every feature requires documentation.
21. Prefer simple architecture over unnecessary abstraction.
22. Preserve backwards compatibility unless explicitly approved.
23. Do not modify unrelated code during a task.
24. Keep changes small and reviewable.
25. Run relevant tests before declaring completion.

---

# 34. AI CODING PROTOCOL

The repository is designed for AI-first development.

AI agents must follow:

SPEC
↓
PLAN
↓
IMPLEMENT
↓
TEST
↓
REVIEW
↓
DOCUMENT

Before making substantial changes:

1. Inspect repository.
2. Read relevant specs.
3. Identify dependencies.
4. Produce an implementation plan.
5. Implement the smallest coherent change.
6. Run tests.
7. Review changes.
8. Update documentation.

Never blindly rewrite large portions of the repository.

Never create duplicate systems when an existing abstraction already exists.

---

# 35. NO-CODE / PROMPT-FIRST DEVELOPMENT

Supercore development will be heavily AI-assisted.

Primary tools may include:

- Codex
- Cursor
- Aider
- Lovable

Tool roles:

Codex:
Architecture
Complex engineering
Review
Refactoring
Security review

Cursor:
Primary implementation
Debugging
Testing
Repository operations

Aider:
Controlled patches
Git-based refactoring
Small focused changes

Lovable:
UI/UX prototyping
Frontend concepts
Dashboard interfaces

Generated code must still conform to Supercore architecture.

AI-generated code is never automatically trusted.

---

# 36. FINANCIAL SAFETY

Even though accounting is not implemented in Phase 0, architecture must anticipate:

double-entry accounting
immutable ledger
VAT
AR
AP
invoices
payments
bank reconciliation
audit trail

Never use floating point for financial amounts.

Establish the monetary value strategy before Accounting Phase begins.

---

# 37. COMMERCE SAFETY

Future Commerce Core will own:

Product
Variant
Catalog
Pricing
Inventory
Cart
Checkout
Order
Payment
Refund
Promotion
Shipment
Return

Do not allow Vendure to define the canonical Supercore model.

Vendure will eventually be an adapter/reference engine.

---

# 38. CRM SAFETY

Future CRM Core will own:

Lead
Company
Account
Contact
Opportunity
Activity
Task
Quote
Pipeline

Do not make Frappe CRM the canonical data owner.

---

# 39. ERP / ACCOUNTING STRATEGY

ERPNext may initially be used as:

- accounting reference engine
- temporary accounting backend
- validation system
- migration bridge

But Supercore must be architected to eventually operate without ERPNext.

The same principle applies to Vendure.

---

# 40. HMRC

Do not implement HMRC submission in Phase 0.

Create only:

TaxProvider
HMRCProvider
VATReturnProvider

interfaces/boundaries.

Future architecture:

Supercore Tax Engine
        ↓
VAT Return
        ↓
Validation
        ↓
Approval
        ↓
HMRC Adapter

HMRC submission must always have an explicit compliance/approval gate until the system is properly certified and operationally validated.

---

# 41. PERFORMANCE

Do not prematurely optimize.

But establish:

- connection pooling
- pagination
- indexed database access
- caching abstraction
- background jobs
- efficient GraphQL queries
- request timeouts
- structured logging

Avoid N+1 query patterns.

---

# 42. OBSERVABILITY

Create foundations for:

- application logs
- health checks
- readiness check
- liveness check
- request correlation
- job monitoring
- error tracking abstraction

Phase 0 does not require a full observability platform.

---

# 43. DOCKER

Create a development Docker environment containing:

PostgreSQL
Redis

Applications should be able to run locally while connecting to these containers.

If practical, provide an optional full Docker Compose environment.

Do not make development unnecessarily slow.

---

# 44. DEVELOPMENT COMMANDS

The repository should provide simple commands such as:

pnpm install

pnpm dev

pnpm build

pnpm test

pnpm test:e2e

pnpm lint

pnpm typecheck

pnpm db:generate

pnpm db:migrate

pnpm db:studio

pnpm worker

Document all commands.

---

# 45. DEFINITION OF DONE

Phase 0 is complete ONLY when:

[ ] Repository builds successfully.

[ ] TypeScript passes.

[ ] Lint passes.

[ ] Unit tests pass.

[ ] PostgreSQL starts.

[ ] Redis starts.

[ ] Database migration works.

[ ] GraphQL endpoint works.

[ ] REST health endpoint works.

[ ] Worker starts.

[ ] Worker can process a test job.

[ ] Next.js application starts.

[ ] Admin application starts or admin architecture is clearly scaffolded.

[ ] Environment validation works.

[ ] CI passes.

[ ] Security baseline exists.

[ ] AGENTS.md exists.

[ ] Architecture documentation exists.

[ ] ADRs exist.

[ ] No secrets are committed.

[ ] No business logic has been incorrectly introduced.

[ ] No external engine has become a canonical data owner.

[ ] README contains complete setup instructions.

---

# 46. EXECUTION RULE

Do NOT ask me unnecessary questions.

First inspect the repository and existing environment.

If the repository is empty, bootstrap it.

If files already exist:

- preserve useful work
- do not overwrite blindly
- inspect before changing
- migrate carefully
- document significant changes

If a technical decision is ambiguous:

1. choose the simplest production-safe option
2. document the decision
3. continue

Do not stop because a non-critical preference is unspecified.

---

# 47. IMPORTANT RESTRICTION

Do NOT implement:

- full Commerce
- full CRM
- full Accounting
- full ERP
- full VAT
- HMRC submission
- complex AI agents
- microservices
- Kubernetes
- unnecessary event infrastructure
- unnecessary cloud infrastructure

during Phase 0.

Phase 0 is foundation only.

---

# 48. FINAL OUTPUT REQUIRED

When implementation is complete, provide a concise engineering report containing:

1. Files created
2. Files modified
3. Architecture implemented
4. Packages installed
5. Database setup
6. API setup
7. Redis setup
8. Worker setup
9. Testing setup
10. CI setup
11. Security setup
12. ADRs created
13. Remaining TODOs
14. Known risks
15. Exact commands to run the system
16. Recommended Phase 1 implementation plan

Also report:

- typecheck result
- lint result
- unit test result
- integration test result
- build result

Do not claim success for anything that was not actually executed and verified.

---

# 49. PHASE 1 HANDOFF

At the end, prepare the repository so the next AI task can begin:

PHASE 1 — SUPERCORE PLATFORM CORE

which will implement:

Tenant
Organization
User
Role
Permission
Customer
Supplier
Address
Currency
Country
Audit

Do NOT implement Phase 1 yet.

Prepare the architecture so Phase 1 can begin cleanly.

---

# FINAL INSTRUCTION

Build Phase 0 now.

Think like a principal engineer building the foundation of a long-lived commercial SaaS platform.

Prefer correctness over speed.

Prefer simplicity over unnecessary abstraction.

Prefer explicit architecture over magic.

Do not invent business rules.

Do not create technical debt merely to finish faster.

The objective is:

A clean, secure, testable, AI-friendly, production-grade Supercore foundation that can evolve into the complete Supercore Commerce OS.