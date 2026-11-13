# ADR-015 — A compact personal platform

Status: **Accepted**, 2026-09-11; decisions 2 and 4 refined by ADR-016. Supersedes
the homepage composition in ADR-011 (removed 2026-11-13; in git history at commit
`8949fdf`) and ADR-012, and the homepage entrance, motif, and stack-wall motion in
ADR-014. Retains the palette (ADR-013), accessible interactions, and existing route
model. Validation results are not recorded in this decision.

## Context

The homepage repeated reliability claims through a large product mock-up,
proof strips, cards, a walkthrough, and a registry preview. The engineer and
professional experience appeared late in a long page. The redesign makes the
person, the work, and the next action easier to find while keeping the detailed
case studies and evaluation records available.

The canonical personal-brand role is **Applied AI Engineer**, as approved by the
owner on 2026-08-14 in the program decision log (formerly
`docs/flagship-transformation/07-decision-log.md`; removed 2026-11-13 and in git
history at commit `8949fdf`). **AI/ML Engineer** remains the factual employment
title at Sevina Technologies. The same log approved the supporting descriptor "LLM
systems, evaluation, AI platforms, and production software" (used in
`public/llms.txt`) and the experience statement "3+ years in software engineering,
with a production-AI focus since 2024" (used in `content/resume.ts`,
`content/profile.json`, `content/site.ts`, and `public/llms.txt`). The role itself is
`SITE.role` in `config/site.ts`.

## Decisions

1. **Light is the initial theme.** Server-render `data-theme="light"`; restore
   an explicit saved dark preference before paint. Keep the current neutral
   palette and one accent per theme. The hero uses solid text, restrained
   borders, and no gradient text or decorative background graph.
2. **Split the opening between identity and a compact DBWhisper figure.** The
   copy introduces Mubin and his work; the figure explains retrieve, generate,
   validate, and execute. Label it **“Illustrative workflow · no live request”**
   in the figure itself. It is an explanation of the architecture, not proof of
   a live execution or an interactive query console. *Refined by ADR-016:* the
   figure is now the boundary inspector, labelled "Illustrative cases · no query
   is sent".
3. **Keep proof scoped.** Link the project count and experience start to their
   records. Read golden-query and unsafe-prompt ratios from `DBWHISPER_GOLDEN`
   in `content/evals.ts`, including their test-set scope. An observed refusal
   rate on a bounded set is not a universal safety guarantee. (Since ADR-016 the
   ratios sit in the inspector footer, and the linked project count and experience
   are in the proof row on `/about` and `/hire`.)
4. **Use one short homepage sequence:** identity and illustration → proof →
   three other projects → one existing interactive DBWhisper walkthrough →
   portrait and professional experience → three essays and current interests
   → contact. The closing contact section is the only dark band in the default
   light homepage. Writing and the walkthrough use subtle light surfaces.
   *Refined by ADR-016:* five sections — identity and inspector, selected work,
   engineer, writing and current interests, contact — with the walkthrough moved
   to the DBWhisper case study.
5. **Remove repeated sections.** Retire the reliability bento, registry preview,
   animated tech wall, and decorative evidence graph. Keep one shared
   `ProjectCard` for the homepage and `/work`; use ruled lists for employment,
   writing, and current interests. Use the smaller section spacing tokens.
   Homepage content is always visible: remove whole-section scroll fades and
   their `Reveal` wrapper. Retain walkthrough controls and hover/focus feedback.
6. **Keep depth and working features.** Preserve existing URLs, four case studies,
   `/evals`, writing, notes, résumé/PDF, theme preference, mobile navigation,
   and the grounded `/api/chat` assistant. Navigation remains Work, Evals,
   Writing, About, with contact through `/hire`. The proposed `/contact`
   migration remains a separate decision.
7. **Share content with consumers.** `content/projects.ts` and
   `content/resume.ts` are the canonical structured project and résumé data,
   including for assistant retrieval and PDF generation. Remove their duplicate
   JSON copies. Keep MDX for long-form content and retain the existing profile,
   FAQ, and skills JSON where they are still used.

## Consequences and verification

The homepage becomes an entry into the portfolio rather than a compressed copy
of every technical page. The illustrative figure was static (since ADR-016 it is
a manual inspector over three curated cases); the existing walkthrough remains the
place to explore stages. Below-fold project images
remain lazy-loaded, and server components assemble content before passing
props to the walkthrough.

Before completion, run type-checking, lint, unit tests, and a production build;
inspect rendered desktop and mobile pages, overflow, both themes, keyboard and
modal behavior, assistant citations, and the retained route links. Run the
applicable accessibility, interaction, metadata, print, and performance gates.
Record observed results and any unresolved limitations separately. This ADR
does not certify deployment or live availability of external projects.
