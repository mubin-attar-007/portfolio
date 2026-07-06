# SPRINT 6 — Writing, timeline, launch hardening

> **Paste to Claude Code:**
> Read spec/CONTENT_MODEL.md §2–5, ARCHITECTURE §8, ENGINEERING §5. This sprint ends in a
> public launch: budgets and audits are gates, not goals.

**Goal:** complete the content surface, make the site machine-legible, hit every budget, launch.

## Tasks

### T1 — Writing section
/writing index (category filter: essays/guides/notes — quiet text filters, not pills),
post layout (Prose, footnotes, related links). Author with user: 2 essays mined from the
flagship DecisionLog + 1 guide (Sprint 5's eval post qualifies).
**AC:** posts read cleanly on mobile; dates/updated visible; draft:true excluded from build.

### T2 — Timeline page
Per CONTENT_MODEL §3 — Built/Learned/Mistake/Changed per phase, vertical, quiet.
**AC:** every phase includes the Mistake line; renders from content only.

### T3 — Machine-readability
`scripts/build-llms-txt.ts` → public/llms.txt (site summary + canonical links per page,
generated from collections). JSON-LD (Person, Article, CreativeWork). sitemap.ts,
robots.ts final (block /dev, /api). Canonicals. OG automation for all routes.
**AC:** llms.txt regenerates on content change; rich-results test passes; share previews
correct for home, flagship, one post.

### T4 — Performance pass
Audit against ENGINEERING §5 on throttled profile: font loading, image sizing, chunk
analysis (`next build` output review), remove any accidental client JS.
**AC:** every budget met; numbers pasted into PR; Lighthouse ≥ 95/100/100/100 on home,
flagship, one post.

### T5 — Accessibility audit
Full keyboard walkthrough of every route; screen-reader spot check (nav, diagram
fallback, assistant, footnotes); axe suite green across all key routes.
**AC:** zero known violations; findings + fixes listed in PR.

### T6 — Launch checklist
BRAND_POSITIONING §7 alignment (LinkedIn/GitHub/resume metric parity) · 404 final ·
analytics events verified · colophon links (source repo if public, llms.txt) ·
custom domain + redirects ({{DOMAIN}}) · uptime check on /api/ask.
**AC:** checklist pasted + ticked in launch PR; site announced only after green.

## Definition of Done
[ ] 3+ published pieces  [ ] Timeline live  [ ] llms.txt + JSON-LD + OG shipped
[ ] All budgets met with evidence  [ ] A11y audit clean  [ ] Off-site alignment done
[ ] The six charter questions each answerable within 5 minutes of landing — final self-review
