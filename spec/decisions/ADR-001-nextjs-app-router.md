# ADR-001 — Next.js (App Router) as the framework

Status: Accepted. Facts updated 2026-11-13 to match the code (Next.js 16; the assistant
route runs on the Node.js runtime).

## Context
The site is mostly static content (case studies, writing, notes) plus two dynamic needs:
a server route for the grounded assistant and interactive islands (diagrams, the
case-study walkthrough, the homepage inspector, the assistant panel).

## Decision
Next.js with the App Router (now 16), RSC-first, static generation for all content
routes. The assistant is a route handler, `app/api/chat/route.ts`, on the Node.js runtime
because retrieval reads content files with `fs`.

## Alternatives considered
- **Astro** — genuinely excellent for this content profile (islands, near-zero JS).
  Rejected because the assistant, dynamic OG, and eval tooling live naturally in one
  Next/Vercel toolchain, and a single framework keeps the solo-maintenance surface small.
- **Remix/RR7** — strong, but its strengths (mutations, nested data) go unused here.
- **Plain SSG (Eleventy)** — cheapest, but interactive diagrams + assistant would bolt on awkwardly.

## Consequences
Must actively defend JS budgets (RSC by default, client allowlist in ARCHITECTURE §5).
Next.js 16 differs from older versions; read `node_modules/next/dist/docs/` before
changing framework APIs (AGENTS.md).
