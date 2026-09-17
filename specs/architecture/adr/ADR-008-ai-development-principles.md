# ADR-008 AI development principles

## Context

The repository is designed for AI-assisted development. Generated code is not automatically trusted.

## Decision

- Cursor is the primary implementation tool.
- Aider may be used later for focused patches.
- Codex is not part of the workflow.
- Agents follow SPEC → PLAN → IMPLEMENT → TEST → REVIEW → DOCUMENT.
- AI cannot bypass domain rules.
- AI cannot submit HMRC filings without an explicit approval gate.
- Architecture changes require ADRs. Database changes require migrations.

## Alternatives

- Treat generated code as correct by default: rejected
- Couple the architecture to one AI vendor: rejected

## Consequences

`AGENTS.md` is mandatory reading. Phase 0 does not include AI agents as a product feature.
