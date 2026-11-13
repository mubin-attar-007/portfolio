# Architecture decision records

Each record states a decision that still governs the code. Where a later record
refines an earlier one, both are kept and the status line says what changed.

| ADR | Decision |
| --- | --- |
| [ADR-001](ADR-001-nextjs-app-router.md) | Next.js App Router (now 16), RSC-first, static content routes; the assistant runs on the Node.js runtime. |
| [ADR-002](ADR-002-tailwind-v4-tokens.md) | Tailwind CSS v4 with every token defined once in `styles/tokens.css`. |
| [ADR-003](ADR-003-mdx-content-collections.md) | Typed content in `content/`, validated by Zod; MDX through `next-mdx-remote`; no CMS. |
| [ADR-004](ADR-004-single-app-not-monorepo.md) | One Next.js app at the repo root, not a monorepo. |
| [ADR-005](ADR-005-custom-system-diagram.md) | A custom, keyboard-navigable `SystemDiagram` instead of React Flow or Mermaid. |
| [ADR-006](ADR-006-assistant-static-index.md) | Assistant retrieval from an in-memory BM25 index over site content; no vector DB. |
| [ADR-007](ADR-007-no-storybook-preview-route.md) | A `/dev/components` preview route instead of Storybook; plain navigation labels. |
| [ADR-008](ADR-008-shiki-highlighting.md) | Shiki highlighting on the server, zero client JS. |
| [ADR-009](ADR-009-lighthouse-budget-gate.md) | Lighthouse budget and social-preview gate in CI. |
| [ADR-012](ADR-012-clerk-fidelity.md) | Layout and motion values measured off clerk.com, the navigation set, and the 2,500 ms LCP budget (partly superseded). |
| [ADR-013](ADR-013-openrouter-palette.md) | The two-theme palette adapted from openrouter.ai: violet in light, lime in dark. |
| [ADR-014](ADR-014-motion-and-modality.md) | Walkthrough playback, native `<details>` methodology, and an `inert` modal boundary (§1 superseded). |
| [ADR-015](ADR-015-personal-platform.md) | A compact personal platform: Applied AI Engineer role, light default, canonical project and résumé data. |
| [ADR-016](ADR-016-inspectable-engineering.md) | The homepage boundary inspector, editorial project rows, and the walkthrough moved to the case study. |
| [ADR-017](ADR-017-responsive-interaction.md) | Responsive interaction feedback without hiding content or adding dependencies. |

Superseded records were removed on 2026-11-13: ADR-010 (the "ember console"
identity, never implemented) and ADR-011 (the "evidence paths" identity, replaced by
ADR-013, ADR-015, and ADR-016). They remain in git history at commit `8949fdf`, as do
the earlier sprint plans, backlog, QA report, brand-positioning template, and
flagship-transformation audit. The numbering gap is intentional.
