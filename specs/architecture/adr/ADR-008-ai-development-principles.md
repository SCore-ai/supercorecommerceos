# ADR-008 AI development principles

## Context

The repository is designed for AI-assisted development. Generated code is not automatically trusted.

The Phase 0 Master Prompt listed Codex, Cursor, Aider, and Lovable. Codex is not used. The remaining three tools have distinct jobs so they do not overwrite each other.

Frontend / UI-UX is a first-class stream. It must not become a second place that invents domain rules.

## Decision

| Tool | Role |
|---|---|
| Cursor | Primary engineer: implementation, debugging, tests, repository operations, production UI wiring |
| Lovable | UI/UX + frontend start/prototyping only |
| Aider | Controlled second engineer: small refactors and focused patches |

```
                    SUPERCORE DEVELOPMENT
                           │
          ┌────────────────┼────────────────┐
          │                │                │
       CURSOR           LOVABLE           AIDER
      MAIN DEV         UI/UX DEV      CONTROLLED PATCH
          │                │                │
          └────────────────┼────────────────┘
                           │
                        Git / CI
```

Frontend path:

```
Requirement → Spec → Lovable → UI/UX prototype → Next.js/Tailwind/shadcn
        → Cursor → production apps/web + apps/admin → Git/CI
```

- Codex is not part of the workflow.
- Agents follow SPEC → PLAN → IMPLEMENT → TEST → REVIEW → DOCUMENT.
- Lovable is PLAN (visual) only. IMPLEMENT is Cursor.
- AI cannot bypass domain rules.
- AI cannot submit HMRC filings without an explicit approval gate.
- Architecture changes require ADRs. Database changes require migrations.
- Lovable must not become a second frontend app or invent GraphQL/REST contracts.
- Aider must not perform large rewrites, phase jumps, or silent architecture changes.

Canonical write-up: `specs/architecture/Supercore Commerce OS — Development Agent Architecture v1.0.md`.

## Alternatives

- Treat generated code as correct by default: rejected
- Use Codex as the architect: rejected for this project
- Couple the architecture to one AI vendor: rejected
- Let Lovable own production frontend: rejected; Cursor ports into this repo
- Put business logic in the UI because it is faster: rejected

## Consequences

`AGENTS.md` and `docs/tooling.md` are mandatory reading.

`.cursor/rules/` applies to Cursor.
`.aider.conf.yml` and `AIDER.md` apply when Aider is invoked.
`docs/lovable-brief.md` is the paste-in brief for Lovable.

Phase 0 does not include AI agents as a **product** feature (that is Phase 7).
