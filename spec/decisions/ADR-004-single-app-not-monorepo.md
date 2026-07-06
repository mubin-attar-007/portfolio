# ADR-004 — Single app, not a monorepo

Status: Accepted (supersedes the monorepo suggestion in early planning)

## Context
Early planning proposed `apps/web` + packages. This is a solo project with one
deployable and no shared consumers.

## Decision
One Next.js app at the repo root. `scripts/` for build tooling. Revisit only when a
second real consumer of shared code exists (e.g., Lab as a separate app).

## Why
Monorepo tooling (turbo/workspaces boundaries) adds ongoing tax with zero current payoff,
and premature structure is the exact "resume-driven engineering" the site argues against.
Documenting this restraint is itself portfolio evidence.

## Consequences
If Lab or a design package ever splits out, migration is mechanical (move to apps/, add
workspace file); nothing in the structure blocks it.
