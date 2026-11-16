# ADR-003 — MDX + typed content collections (no CMS)

Status: Accepted. Amended 2026-11-13 to record the implementation: the original
decision named `@content-collections/*`; the code uses `next-mdx-remote` with the same
intent (`content/schema.ts`).

## Context
Long-form content needs rich embedded components (DecisionLog, CodeBlock) plus strict,
build-time-validated metadata feeding pages, feeds, the sitemap, and the assistant.

## Decision
Content lives in `content/`, validated by Zod schemas in `content/schema.ts`, with types
inferred from those schemas. Invalid content throws, so the build fails.

- Structured records (projects, evaluations, timeline) are typed TypeScript modules
  parsed with Zod at module load. The résumé (`content/resume.ts`) is an `as const`
  module that TypeScript checks but no schema validates.
- Writing and notes are MDX, loaded by `lib/mdx-collection.ts`: `fs` reads, then
  `compileMDX` from `next-mdx-remote/rsc` parses frontmatter for Zod and renders the
  body with the component map. `/now` is one MDX file loaded by `lib/now.ts`.
- Case-study bodies are server components in `components/case-studies/`, fed by the
  project records (see CONTENT_MODEL.md §1).

## Alternatives considered
- **Contentlayer** — the original inspiration; unmaintained. Rejected.
- **Headless CMS (Sanity/Contentful)** — runtime dependency, editing UI nobody needs
  (author = engineer in an editor), hosting/cost overhead. Rejected.
- **Plain `fs` + gray-matter without schemas** — re-implements validation/typing poorly.
  The adopted loader keeps plain `fs` reads but validates every file with Zod.

## Consequences
Content is code-reviewed like code; git history doubles as an honest changelog of claims.
