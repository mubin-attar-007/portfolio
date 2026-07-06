# CLAUDE.md — Personal Engineering Platform (Mubin Attar)

You are the implementing engineer. The specs in `spec/` are the **source of truth**. You
implement; you do not invent product, design, or copy decisions. If something isn't
specified, add it to the spec first, then implement.

## What this project is

A personal portfolio for an AI/ML engineer, built as a software product.
Positioning: **evidence over claims, architecture over screenshots, engineering over marketing.**
Visual language: **calm, light, typography-first, generous whitespace** (Stripe / Linear /
Anthropic docs — *their restraint, not their branding*). NOT a dark neon "AI startup" landing page.

The visitor is a hiring manager / CTO / prospective client. Within five minutes they must
understand: what I build, how I think, why I make decisions, and whether to talk to me.

## Read before implementing anything
- `spec/PROJECT_CHARTER.md` — vision & principles
- `spec/DESIGN.md` — tokens, type, color, motion, layout, **anti-patterns (§9 is LAW)**
- `spec/ENGINEERING.md` — coding rules, budgets, testing, DoR/DoD
- `spec/ARCHITECTURE.md` — rendering rules, data flow, client allowlist (§5)
- `spec/CONTENT_MODEL.md` — content schemas; ALL copy lives in `content/`
- `spec/AI_ASSISTANT.md` — the grounded assistant contract
- the current sprint file in `spec/sprints/`
- ADRs in `spec/decisions/` — do not contradict without flagging (but see "Stack divergences" below)

## Stack — pragmatic adaptation of the spec (this project, decided with the owner)

The spec's ADRs assume a greenfield stack. This repo is a live project; we keep what works
and follow the spec's **design + content model + IA** exactly. Divergences from the ADRs,
each deliberate and documented:

| Spec / ADR | This repo | Note |
|---|---|---|
| pnpm | **npm** | existing lockfile |
| Next 15 | **Next 16 (modified)** | read `node_modules/next/dist/docs/` before any Next API; middleware is `proxy.ts`; `params` is async |
| @content-collections + Zod (ADR-003) | **next-mdx-remote/rsc + Zod at load** | build FAILS on invalid frontmatter — same intent (typed, validated, build-time-checked) |
| Anthropic + Voyage (ADR-006) | **Gemini generation + local BM25 retrieval** | only a Gemini key is available; retrieval-first, works at zero LLM quota |
| Vitest + RTL | **node --test** (lib) + **Playwright + @axe-core/playwright** (a11y) | |
| `src/` layout | **root-level** `app/ components/ lib/ content/ config/ constants/ styles/ types/` | keeps the `@/*`→root alias; adopt the spec's SUB-organization (`components/{ui,layout,sections,diagrams,mdx,features}`) |
| Shiki (ADR-008) | **Shiki** (build-time) | as spec |
| asciinema | **deferred (P2)** | Figure/CodeBlock until a real recording exists |

Everything NOT in this table follows the spec verbatim.

## Laws (non-negotiable)
1. `strict: true`. No `any`, no `@ts-ignore` (use `@ts-expect-error` + reason, sparingly).
2. Server Components by default. `"use client"` only where `spec/ARCHITECTURE.md §5` allows.
3. No hardcoded copy in components — all text comes from `content/` or `config/site.ts`.
4. No hardcoded colors, spacing, radii, shadows, or durations — **tokens only** (`styles/tokens.css`).
5. No new dependency without checking `spec/decisions/`. If not covered, ask before adding.
6. Every interactive element: keyboard operable, visible focus, accessible name. **WCAG 2.2 AA.**
7. Respect `prefers-reduced-motion` in every animation. Animate opacity/transform/color only.
8. No magic numbers — named constants in `constants/`.
9. Every exported component/function gets a JSDoc block: purpose, props, a11y notes.
10. Zero TypeScript errors, zero ESLint errors, zero console errors/warnings at "done".

## Design guardrails (summary — full list is spec/DESIGN.md §9, which is LAW)

BANNED: gradient text, glow/neon, glassmorphism/blur, particle/mesh/grid backgrounds, typing
animations, skill-badge walls, logo marquees, uppercase headings, emoji in UI chrome,
scroll-jacking/parallax, **dark theme as default**, **more than ONE accent color**, card-grids
as the default layout, any metric without a method footnote, "looks impressive" as a justification.
**Light theme is the brand; dark is a preference.** Accent (`#1D4ED8`) appears in ≤2 elements per viewport.
Litmus test: *would this look at home inside excellent technical documentation?*

## Content laws
- Every capability is backed by an artifact (metric, diagram, code, recording, decision record).
- **Every metric links to its method.** No number ships without a one-sentence method footnote.
- Never fabricate a metric, date, employer, or capability. If a number can't be shared, describe
  the mechanism and say so.
- Voice: first person, plain, numbers over adjectives, sentence case. Banned words in CONTENT_MODEL §7.

## Workflow
1. Sprint by sprint from `spec/sprints/`; tasks in order. Restate acceptance criteria first (DoR).
2. Small, reviewable diffs. Conventional Commits. Branch `feature/<slug>` off `main`.
3. After each task: `npm run build` + `npm run lint` + `npm test` (+ a11y where relevant). Fix before proceeding.
4. A task is done only when the sprint's DoD checklist passes — including a11y.
5. Deploy is HELD; per-sprint Vercel previews; production only on owner green-light.

## Commands
```bash
npm run dev            # local dev
npm run build          # production build (fails on Zod content errors)
npm run lint           # eslint
npm test               # node --test (lib + content schema fixtures)
npm run test:a11y      # playwright + axe-core, every route × light/dark; needs a server on :3200; exits 1 on any WCAG 2.2 AA violation
```

## Repository layout (root-level adaptation of ARCHITECTURE §2)
```
content/            # ALL copy: projects/ writing/ timeline/ site/ resume/  (+ existing JSON during migration)
public/             # static assets, og/, resume.pdf, llms.txt (generated)
spec/               # the specs (read-only reference)
scripts/            # build-embeddings, build-llms-txt, check-links
app/
├── (site)/         # public routes: page.tsx, work/, writing/, about/, timeline/, contact/
├── api/            # ask/route.ts, chat (existing)
├── og/             # dynamic OG (satori)
├── dev/components/ # kitchen-sink preview (noindex)
├── sitemap.ts · robots.ts · not-found.tsx
components/{ui,layout,sections,diagrams,mdx,features}/
lib/                # pure, tested: content loaders, search, rate-limit, seo, format
config/ site.ts, nav.ts        constants/        styles/ tokens.css, globals.css        types/
```

If reality and this file disagree, the `spec/` files win — update this file in the same change.
