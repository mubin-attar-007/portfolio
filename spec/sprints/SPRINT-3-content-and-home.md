# SPRINT 3 — Content system, homepage, core pages

> **Paste to Claude Code:**
> Read spec/CONTENT_MODEL.md fully and spec/DESIGN.md §4–5. The user must have completed
> spec/BRAND_POSITIONING.md — if content/site/home.md is missing real copy, STOP and say
> so (Definition of Ready). Implement task by task.

**Goal:** the site becomes real: typed content pipeline + homepage + core pages.
**Exit demo:** home, /work, /about, resume live from `content/` only.

## Tasks

### T1 — Content collections
`src/content-collections.ts`: schemas for projects/writing/timeline/site/resume exactly
per CONTENT_MODEL (Zod). MDX pipeline: remark-gfm, rehype-slug + anchors, footnotes,
Shiki. Fixture files per collection + schema tests (valid passes, each invalid field fails).
**AC:** build fails loudly on a bad frontmatter fixture; types flow to routes with no casts.

### T2 — MDX component map
Wire every CONTENT_MODEL §6 component into the MDX renderer; plain markdown elements
route through Prose styles.
**AC:** a kitchen-sink MDX fixture using every component renders on a dev route.

### T3 — Site config + copy intake
`src/config/site.ts` (name, headline, socials, nav) reading from content/site where
sensible. Populate content/site/*.md from BRAND_POSITIONING final values. Global
placeholder replacement.
**AC:** zero `{{PLACEHOLDER}}` strings remain (`grep` gate in CI).

### T4 — Homepage
Implement DESIGN §4 tempo exactly and §5 hero exactly. Proof strip = 3 mono metrics with
footnote links (from content/site/home.md). Flagship feature pulls the `featured` project
(diagram thumbnail = static render of its SystemDiagram, 3 metric deltas, one link).
Secondary projects = compact list rows. "How I think" = 3 principles from content.
Selected writing = latest 3 (placeholder posts ok until Sprint 6). Now snippet. Contact CTA.
**AC:** hero has one headline, one paragraph, primary+ghost CTA, no badges, single fade
only; accent budget audit passes per viewport; section backgrounds alternate per tempo;
LCP element is the H1 (no image); Lighthouse ≥ 95.

### T5 — Work index
Featured study as large feature block; others as rows (title, summary, status tag,
2 metrics, date). No card grid.
**AC:** works with 1 project and with 6 (fixtures); keyboard/axe clean.

### T6 — About + Resume + Contact
About: long bio, principles, optional portrait (Figure), links. Resume: rendered from
content/resume/resume.md + prominent PDF link (analytics event). Contact: one sentence +
mailto (obfuscation-free; spam is acceptable, friction is not).
**AC:** resume markdown and PDF metrics match (manual check documented in PR).

## Definition of Done
[ ] All routes static-generated  [ ] Zero hardcoded copy (grep for suspicious strings)
[ ] Schema tests green  [ ] Homepage matches DESIGN §4/§5 exactly  [ ] axe + keyboard clean
[ ] Budgets met (home ≤ 120 KB gz route JS)  [ ] Placeholder grep gate in CI
