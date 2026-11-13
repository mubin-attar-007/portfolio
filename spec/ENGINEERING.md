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
(conditional rendering, keyboard handling, formatting).

## 4. Accessibility — WCAG 2.2 AA (contractual)

- Semantic landmarks (`header/nav/main/footer`), one `h1` per page, logical heading order.
- Full keyboard operability incl. SystemDiagram and assistant panel; visible focus everywhere;
  skip-to-content link.
- `prefers-reduced-motion` respected globally (see design-system.md §6).
- Images: meaningful `alt`; diagrams get text alternatives (the narration list).
- Forms/controls: labeled, error text linked via `aria-describedby`.
- Automated gate: `npm run test:a11y` (Playwright + axe-core, WCAG 2.0–2.2 A/AA tags) on
  18 routes × light/dark × 1280/768/360px, plus the open mobile menu, the open assistant
  panel, the reduced-motion contract, and keyboard focus traps → **zero violations**.
  Manual check for UI changes: a keyboard-only pass and a screen-reader spot check.

## 5. Performance budgets

Measured by `npm run test:lighthouse` (`scripts/lighthouse-budget.mjs`): the Lighthouse
CLI, mobile form factor with simulated throttling, the median of three runs per route
(`LIGHTHOUSE_RUNS`), against a local standalone production server. Routes: `/`,
`/work/dbwhisper`, and `/writing/a-validator-is-not-a-better-prompt`. See ADR-009.

| Metric | Budget | Enforced |
|---|---|---|
| Lighthouse | ≥ 95 Performance · 100 Accessibility · 100 Best Practices · 100 SEO | fails the gate |
| LCP | ≤ 2.5 s | fails the gate |
| CLS | < 0.05 | fails the gate |
| TBT (lab) | < 150 ms | fails the gate |
| First-load JS (transferred) | ≤ 120 KB home · ≤ 90 KB case study and writing | printed, advisory |
| INP | < 200 ms | field metric; no lab gate |
| Fonts | ≤ 130 KB of woff2 downloaded per page, self-hosted by `next/font` | target; not measured |
| Assistant panel chunk | lazy, loaded on open; ≤ 60 KB target | not measured |

The first-load JS targets are advisory: the measured transfer is dominated by framework
chunks that load on every route, so a hard limit would fail on that pre-existing floor
rather than on a regression (the comment in `scripts/lighthouse-budget.mjs`). Reaching
the targets is open optimization work.

Images use `next/image` with explicit dimensions, lazy below the fold. Heavy things are
lazy by rule: the assistant panel and below-fold images. Static generation for all content
routes; no client data fetching for content.

## 6. Testing (right-sized, honest)

- **Unit:** the Node.js test runner (`node:test`). `npm test` runs `test/**/*.test.mts`
  with `test/alias-loader.mjs` resolving the `@/` alias and extensionless TS imports;
  Node 24 strips the types natively. As of 2026-11-13: 39 tests in 7 files covering
  content law (projects, metric methods, links), feeds, formatting, navigation,
  reading time, citation links, and assistant retrieval.
- **Assistant grounding:** `test/retrieval.test.mts` checks the BM25 corpus against the
  question set in `lib/ai/test-questions.ts`, the relevance floor for off-topic queries,
  and the injection screen — without any LLM quota. See AI_ASSISTANT.md §7.
- **Browser gates (Playwright scripts in `scripts/`):** accessibility (`test:a11y`),
  interaction contracts (`test:interaction`), motion (`test:motion`), accent drift
  (`test:hue`), print (`test:print`), screenshots and overflow (`test:screens`), links
  (`test:links`), deployment smoke (`test:smoke`), and Lighthouse (`test:lighthouse`).
  Every gate runs in Chromium only (CI installs no other engine); Firefox and
  Safari are not exercised by any automated check.
- Not chasing coverage %; chasing "every behavior that can silently break has a test."

## 7. Git workflow

- `main` is the deployable branch; work lands through pull requests from short-lived
  branches. No long-lived develop branch (solo project).
- Conventional Commits. PR description: what/why + screenshots for visual changes +
  DoD checklist pasted and ticked.
- CI (`.github/workflows/ci.yml`) on every pull request and every push to `main`:
  type-check → lint → test → build → browser gates (a11y, interaction, motion, accent
  drift in both themes, print, internal links, smoke). Lighthouse budgets run on pushes
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
assistant route logs nothing; rate limiting keeps only an in-memory client key and
timestamps.
