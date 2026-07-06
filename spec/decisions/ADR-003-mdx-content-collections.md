# ADR-003 — MDX + content-collections (typed content, no CMS)

Status: Accepted

## Context
Case studies need rich embedded components (DecisionLog, SystemDiagram) plus strict,
build-time-validated frontmatter feeding pages, search, llms.txt, and the assistant.

## Decision
MDX files in `content/`, processed by `@content-collections/*` with Zod schemas.
Types inferred from schemas. Build fails on invalid content.

## Alternatives considered
- **Contentlayer** — the original inspiration; unmaintained. Rejected.
- **Headless CMS (Sanity/Contentful)** — runtime dependency, editing UI nobody needs
  (author = engineer in an editor), hosting/cost overhead. Rejected.
- **Plain `fs` + gray-matter** — workable but re-implements validation/typing poorly.

## Consequences
Content is code-reviewed like code; git history doubles as an honest changelog of claims.
