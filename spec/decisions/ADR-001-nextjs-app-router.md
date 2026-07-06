# ADR-001 — Next.js (App Router) as the framework

Status: Accepted

## Context
The site is mostly static content (MDX case studies, writing) plus two dynamic needs:
an edge API for the grounded assistant and interactive islands (diagrams, recordings).

## Decision
Next.js 15+ with the App Router, RSC-first, static generation for all content routes.

## Alternatives considered
- **Astro** — genuinely excellent for this content profile (islands, near-zero JS).
  Rejected because the assistant, dynamic OG, and eval tooling live naturally in one
  Next/Vercel toolchain, and a single framework keeps the solo-maintenance surface small.
- **Remix/RR7** — strong, but its strengths (mutations, nested data) go unused here.
- **Plain SSG (Eleventy)** — cheapest, but interactive diagrams + assistant would bolt on awkwardly.

## Consequences
Must actively defend JS budgets (RSC by default, client allowlist in ARCHITECTURE §5).
Framework choice itself becomes demonstrable engineering judgment in an essay.
