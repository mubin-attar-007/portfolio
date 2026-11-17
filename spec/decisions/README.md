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
| [ADR-006](ADR-006-assistant-static-index.md) | Assistant retrieval from an in-memory BM25 index over site content; no vector DB (amended 2026-11-16: every published collection is indexed, and relevance is judged per question). |
| [ADR-007](ADR-007-no-storybook-preview-route.md) | A `/dev/components` preview route instead of Storybook; plain navigation labels. |
| [ADR-008](ADR-008-shiki-highlighting.md) | Shiki highlighting on the server, zero client JS. |
| [ADR-009](ADR-009-lighthouse-budget-gate.md) | Lighthouse budget gate in CI, with a metadata gate over every sitemap URL. |
| [ADR-014](ADR-014-motion-and-modality.md) | Walkthrough playback, native `<details>` methodology, and an `inert` modal boundary (§1 superseded). |
| [ADR-015](ADR-015-personal-platform.md) | The Applied AI Engineer role, scoped proof, and canonical project and résumé data (its theme and homepage decisions superseded by ADR-018). |
| [ADR-018](ADR-018-clerk-grade-visual-system.md) | The Clerk-grade visual system: light-only with dark plates and pages, Geist only, the motion law, one pattern per page, `/contact` and the field reports. |

Superseded records were removed on 2026-11-13: ADR-010 (the "ember console"
identity, never implemented) and ADR-011 (the "evidence paths" identity). They remain
in git history at commit `8949fdf`, as do the earlier sprint plans, backlog, QA report,
brand-positioning template, and flagship-transformation audit.

ADR-012 (Clerk fidelity), ADR-013 (the two-theme openrouter palette), ADR-016 (the
homepage boundary inspector) and ADR-017 (responsive interaction) were removed on
2026-11-17, superseded by ADR-018, which carries forward the parts that still govern
(the LCP budget's rationale, the curated footer, the inspector's honesty rules). They
remain in git history at commit `9c1f0f0`. The numbering gaps are intentional.

Two removed documents record which claims and wording the owner approved; check them
before changing positioning or published numbers:

- [Decision log](https://github.com/mubin-attar-007/portfolio/blob/8949fdf/docs/flagship-transformation/07-decision-log.md)
  — the approved role, descriptor, experience statement, and route decisions.
- [Claim ledger](https://github.com/mubin-attar-007/portfolio/blob/8949fdf/docs/flagship-transformation/03-claim-ledger.md)
  — each public claim with its evidence status
  ([CSV](https://github.com/mubin-attar-007/portfolio/blob/8949fdf/docs/flagship-transformation/evidence/claims/claim-ledger.csv)).
- The former design specification:
  [spec/DESIGN.md](https://github.com/mubin-attar-007/portfolio/blob/8949fdf/spec/DESIGN.md).
