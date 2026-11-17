# ENGINEERING.md — Standards, budgets, workflow

These are laws, not suggestions. The site must itself be evidence of engineering quality.

## 1. TypeScript

`tsconfig.json` runs `strict` plus `noUncheckedIndexedAccess`, `noImplicitOverride`,
`noFallthroughCasesInSwitch`, `verbatimModuleSyntax`, and `isolatedModules`.
No `any`. No `@ts-ignore` (only `@ts-expect-error` with a trailing reason). All exported
APIs explicitly typed. Content collections are validated with Zod (`content/schema.ts`)
and their types are inferred with `z.infer` — never duplicated by hand.

## 2. Code rules

- Server Components first. Client components only per ARCHITECTURE.md §5, as leaf nodes.
- No duplicated logic or styles: extract on second occurrence (`lib/`, `components/ui/`).
- No magic numbers/strings — `constants/`, `config/`, or tokens.
- Composition over inheritance; no prop drilling past 2 levels (compose or context).
- Files are kebab-case (`components/ui/text-link.tsx`, `lib/use-inert-background.ts`);
  components are PascalCase named exports. Default exports only where Next.js requires
  them (pages, layouts, route files, metadata files).
- Every exported symbol: JSDoc — purpose, params, a11y notes where relevant.
- Comments explain *why*, never *what*.
- Zero console errors/warnings in dev and prod. Zero ESLint suppressions without a reason comment.

## 3. Component contract (every component in `components/ui` and `components/mdx`)

Header JSDoc must document: **Purpose · Props · Variants · Accessibility · Performance
notes**. Plus: usage example added to `/dev/components`, and a test if it contains logic
(conditional rendering, keyboard handling, formatting). The primitives and their APIs
are listed in design-system.md §5.

## 4. Accessibility — WCAG 2.2 AA (contractual)

- Semantic landmarks (`header/nav/main/footer`), one `h1` per page, logical heading order.
- Full keyboard operability incl. SystemDiagram and assistant panel; visible focus everywhere;
  skip-to-content link.
- `prefers-reduced-motion` respected globally (see design-system.md §6).
- Images: meaningful `alt`; diagrams get text alternatives (the narration list).
- Forms/controls: labeled, error text linked via `aria-describedby`.
- Automated gate: `npm run test:a11y` (Playwright + axe-core: the WCAG 2.0–2.2 A/AA
  rules, plus the best-practice rules Lighthouse scores, such as `heading-order`, and
  `landmark-unique`) on every route in its list — `/contact` and both `/work/field/*`
  reports included — at 1280/768/360px, plus the open Work and About menus, the open
  mobile menu, the open assistant panel, the reduced-motion contract, and keyboard
  focus traps → **zero violations**. The site is light-only (ADR-018), so there is one
  pass, not one per theme; the dark pages and plates are covered inside it.
  Manual check for UI changes: a keyboard-only pass and a screen-reader spot check.

## 5. Performance budgets

Measured by `npm run test:lighthouse` (`scripts/lighthouse-budget.mjs`): the Lighthouse
CLI, mobile form factor with simulated throttling, the median of three runs per route
(`LIGHTHOUSE_RUNS`), against a local standalone production server. Routes: `/`,
`/work/dbwhisper`, and `/writing/a-validator-is-not-a-better-prompt`. See ADR-009.

A budget is the standard the site is held to. The last column says what CI enforces
today. Where the code misses a budget, the gap is a defect to fix, not a reason to move
the budget; changing a budget needs an ADR.

| Metric | Budget | Enforced today |
|---|---|---|
| Lighthouse | ≥ 95 Performance · 100 Accessibility · 100 Best Practices · 100 SEO | fails the gate |
| LCP | ≤ 2.5 s (raised from 2.0 s in 2026; the reason is recorded in ADR-018, "Carried forward") | fails the gate |
| CLS | < 0.05 | fails the gate |
| TBT (lab) | < 150 ms | fails the gate |
| Route JS (gzip, first load) | ≤ 120 KB home · ≤ 90 KB content pages | printed, not failing; over budget (CI, 2026-11-13: home 174 KB, case study 175 KB, writing 167 KB) |
| Assistant panel chunk | lazy, loaded on open; ≤ 60 KB | not yet measured |
| INP | < 200 ms | field metric; no lab gate and no field data yet |
| Fonts | ≤ 130 KB woff2 in total, self-hosted by `next/font` | not yet measured |
| Images | AVIF/WebP through `next/image`, explicit dimensions, lazy below the fold | review |

The route-JS gate prints rather than fails because framework chunks shared by every
route make up most of the transfer, so a hard limit would fail on that floor rather than
on a regression (see the comment in `scripts/lighthouse-budget.mjs`). Whether the budget
is reachable on this framework is open; meeting it or changing it through an ADR are
the two ways to close the gap.

Heavy things are lazy by rule: the assistant panel, diagrams below the fold, demo videos
(no video bytes until played), and below-fold images. Static generation for all content
routes; no client data fetching for content.

Prefetch is opt-in, never by viewport: every `next/link` sets `prefetch={false}`
(`TextLink` included), and only the primary nav prefetches, on hover or focus
(`components/layout/nav-link.tsx`). A viewport prefetch downloads each linked route
and preloads its stylesheet; on /about that was 13 background requests and a Chrome
warning about the unused CSS. ESLint fails a `<Link>` without a `prefetch` prop
(`eslint.config.mjs`), and the smoke test fails on any console warning.

## 6. Testing (right-sized, honest)

- **Unit (requirement):** every exported function in `lib/`, logic-bearing components,
  and content schema validation have tests. The runner is Node's `node:test`: `npm test`
  runs `test/**/*.test.mts` with `test/alias-loader.mjs` resolving the `@/` alias and
  extensionless TS imports (a file before a same-named directory, as the bundler
  resolves them); Node 24 strips the types natively.
  Current coverage (2026-11-17): 153 tests in 21 files covering content law (projects,
  metric methods, links, and recordings served only while a project lists them), feeds,
  formatting, navigation, reading time, env parsing
  (`GEMINI_MODEL`), the content-slug guard (`lib/content-slug.ts`); the assistant
  (corpus, retrieval, citations, the injection guard, answer formatting, the chat
  contract and handler, the rate limiter); the published evidence: no retired or
  retyped evaluation figure, the superseded job title, and the role's sentence form
  (`evidence.test.mts`); `public/llms.txt` completeness, with the static pages read
  from `app/` (`llms-txt.test.mts`); the résumé PDF's currency and links
  (`resume-pdf.test.mts`); search metadata — `pageMetadata`, note descriptions, and the
  title and description limits for every note, essay and case study (`seo.test.mts`);
  and the icons — not the create-next-app favicon, drawn in the current palette, and
  rendered from `app/icon.svg` (`icons.test.mts`). Gap against the requirement: some
  exported `lib/` functions have no direct test yet, notably the MDX collection loader
  beyond its slug guard and excerpt (`lib/mdx-collection.ts`), which compiles React and
  so cannot run under the plain test runner.
- **Assistant grounding:** `test/retrieval.test.mts` checks the corpus and per-question
  relevance against 16 detailed and 24 short questions (`test/fixtures/test-questions.ts`),
  plus off-topic questions, follow-ups and every starter's fallback;
  `test/guard.test.mts` checks the injection screen against attack and legitimate
  question lists; `test/chat-handler.test.mts` drives the route's handler with real
  requests and fake model streams — all without any LLM quota. See AI_ASSISTANT.md §7.
- **Browser gates (Playwright scripts in `scripts/`):** accessibility (`test:a11y`),
  interaction contracts (`test:interaction`), motion (`test:motion`), accent drift
  (`test:hue`), print (`test:print`), screenshots and overflow (`test:screens`), links
  (`test:links`), deployment smoke with zero console errors or warnings
  (`test:smoke`), metadata on every sitemap URL (`test:metadata`, no browser), and
  Lighthouse (`test:lighthouse`).
  What ADR-018 changed in them: every gate runs the light site once (no `THEME=dark`
  pass); `test:hue` allows the neutrals, the violet accent, the plate cyan and the
  status green, amber and red; the boundary-inspector and walkthrough checks run on
  `/work/dbwhisper`, where the inspector now lives, instead of `/`; `test:motion`
  checks the arrow-swap caret, the menus, the tab pill and panel crossfade, the
  marquee's hover pause, the copy chip and each reduced-motion alternative; the link
  and smoke gates include `/contact` and the field reports, which are `noindex` but
  linked and must resolve; and the dialog and trigger names come from
  `components/assistant/copy.ts` (AI_ASSISTANT.md §5).
  Every gate runs in Chromium only (CI installs no other engine); Firefox and
  Safari are not exercised by any automated check.
- **Copy gate (`test:copy`, `scripts/copy-audit.mjs`):** reads the prerendered HTML in
  `.next/server/app` after a build — no browser, no server — and fails when an inline
  element touches the next word ("structural</strong>— the"). JSX drops whitespace
  that contains a line break, so only the built output proves the text reads
  correctly; the fix is an explicit `{" "}`. An empty inline element (a CSS dot) and a
  text-only one marked `aria-hidden="true"` (a heading's `#` anchor, a prompt glyph)
  carry no words, so they are dropped first and their neighbours checked against each
  other.
- Not chasing coverage %; chasing "every behavior that can silently break has a test."

## 7. Git workflow

- `main` is the deployable branch; work lands through pull requests from short-lived
  branches. No long-lived develop branch (solo project).
- Conventional Commits. PR description: what/why + screenshots for visual changes +
  DoD checklist pasted and ticked.
- CI (`.github/workflows/ci.yml`) on every pull request and every push to `main`:
  type-check → lint → test → build → copy gate → browser gates (a11y, interaction,
  motion, accent drift, print, internal links, metadata, smoke). Lighthouse budgets run on pushes
  to `main` and on pull requests that target `main`. Red CI = no merge, no exceptions.

## 8. Definition of Ready (before coding any story)

Requirements + acceptance criteria written · responsive behavior defined · a11y notes
present · all states listed (default/hover/focus/active/loading/empty/error) · content
exists in `content/` (placeholder copy is a spec violation, not a stopgap).

## 9. Definition of Done (per story — paste into PR)

```
[ ] Acceptance criteria met
[ ] Responsive 360 / 768 / 1280
[ ] Keyboard + focus pass; axe clean on affected routes
[ ] prefers-reduced-motion respected
[ ] Typed; zero TS errors; zero ESLint errors
[ ] Tests added/updated and passing
[ ] Published figures re-checked against the project's README and claim audit at the
    cited commit; `npm run build:resume` run if résumé data or a figure changed
[ ] No hardcoded copy/colors/spacing (tokens + content only)
[ ] JSDoc + /dev/components entry (if component)
[ ] Budgets respected (check bundle output for route)
[ ] Zero console errors
[ ] Docs updated if behavior/structure changed
```

## 10. Dependency policy

Every new dependency needs: an ADR note (or falls under an existing ADR), a size check
(bundlephobia), maintenance check (commits in last 6 months), and a one-line justification
in the PR. Prefer platform → stdlib → tiny lib → framework, in that order.
GitHub Actions versions are kept current by Dependabot (`.github/dependabot.yml`, one
grouped pull request a month); npm dependencies are upgraded deliberately, not by bot.

## 11. Observability & analytics

Privacy-first analytics: `@vercel/analytics`, rendered only on Vercel deployments
(`VERCEL=1`); no cookies, no consent banner. Custom events, sent through
`lib/analytics.ts`: `case_study_read_depth` (25/50/75/100, from the case-study reading
outline) and `resume_downloaded`. Error tracking: none beyond the platform's logs. The
assistant route logs one JSON line per answered turn — mode, note, passages retrieved,
timings, the finish or failure reason and token counts; never the question, the answer,
the key or the client address — warns with the model id and HTTP status when Gemini
rejects a request, and warns when a content collection is unreadable. The rate limiter
keeps salted address hashes, timestamps and daily counters in memory only.
