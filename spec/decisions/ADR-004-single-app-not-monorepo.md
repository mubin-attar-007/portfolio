# ADR-004 — Single app, not a monorepo

Status: Accepted (supersedes the monorepo suggestion in early planning)

## Context
Early planning proposed `apps/web` + packages. This is a solo project with one
deployable and no shared consumers.

## Decision
One Next.js app at the repo root. `scripts/` for build tooling. Revisit only when a
second real consumer of shared code exists (e.g., a separate experiments app).

## Why
Monorepo tooling (turbo/workspaces boundaries) adds ongoing tax with zero current payoff,
and premature structure is the exact "resume-driven engineering" the site argues against.
Documenting this restraint is itself portfolio evidence.

## Consequences
If a second app or a design package ever splits out, migration is mechanical (move to
apps/, add workspace file); nothing in the structure blocks it. The OpenNext Cloudflare
build (`npm run build:sites`) packages the same app and is not a second consumer.
