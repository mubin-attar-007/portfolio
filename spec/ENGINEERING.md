# ENGINEERING.md — Standards, budgets, workflow

These are laws, not suggestions. The site must itself be evidence of engineering quality.

## 1. TypeScript

`tsconfig` strict set: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`,
`exactOptionalPropertyTypes`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`.
No `any`. No `@ts-ignore` (only `@ts-expect-error` with a trailing reason). All exported
APIs explicitly typed. Content schemas via Zod; types inferred from schemas — never duplicated.

## 2. Code rules

- Server Components first. Client components only per ARCHITECTURE.md §5, as leaf nodes.
- No duplicated logic or styles: extract on second occurrence (`lib/`, `components/ui/`).
- No magic numbers/strings — `src/constants/` or tokens.
- Composition over inheritance; no prop drilling past 2 levels (compose or context).
- Files: components `PascalCase.tsx`, lib `kebab-case.ts`; named exports (default only for pages).
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
- `prefers-reduced-motion` respected globally (see DESIGN §1.6).
- Images: meaningful `alt`; diagrams get text alternatives (the narration paragraph).
- Forms/controls: labeled, error text linked via `aria-describedby`.
- Automated gate: Playwright + axe on `/`, `/work`, one case study, one post, `/dev/components`
  → **zero violations**. Manual gate per sprint: keyboard-only pass + VoiceOver spot check.

## 5. Performance budgets (measured on Vercel preview, Moto G Power throttling, Lighthouse CI)

| Metric | Budget |
|---|---|
| LCP | ≤ 2.0 s |
| CLS | < 0.05 |
| INP | < 200 ms |
| TBT (lab) | < 150 ms |
| Route JS (gz) | ≤ 90 KB content pages · ≤ 120 KB home · assistant chunk lazy, ≤ 60 KB |
| Fonts | ≤ 130 KB total woff2, self-hosted |
| Images | AVIF/WebP via `next/image`, explicit dimensions, lazy below fold |
| Lighthouse | ≥ 95 Performance · 100 Accessibility · 100 Best Practices · 100 SEO |

Heavy things are lazy by rule: asciinema-player, assistant panel, diagrams below fold.
Static generation for all content routes; no client data fetching for content.

## 6. Testing (right-sized, honest)

- **Unit (Vitest + RTL):** all of `lib/` (100% of exported functions), logic-bearing
  components (Metric formatting, DecisionLog rendering, diagram keyboard nav), content
  schema validation (fixtures for every collection).
- **E2E (Playwright):** smoke nav flows + axe a11y suite (above) + assistant happy path (mocked API).
- **Assistant evals:** golden-set harness per AI_ASSISTANT.md §7 — run in CI, regression-gated.
- Not chasing coverage %; chasing "every behavior that can silently break has a test."

## 7. Git workflow

- Trunk-based: `main` (protected, deployable) ← PRs from `feature/<slug>` / `fix/<slug>` /
  `content/<slug>`. No long-lived develop branch (solo project; see ADR notes).
- Conventional Commits. PR description: what/why + screenshots for visual changes +
  DoD checklist pasted and ticked.
- CI on every PR: `typecheck → lint → test → build` (+ Lighthouse CI and Playwright on
  `main`-targeting PRs). Red CI = no merge, no exceptions.

## 8. Definition of Ready (before coding any story)

Requirements + acceptance criteria written · responsive behavior defined · a11y notes
present · all states listed (default/hover/focus/active/loading/empty/error) · content
exists in `content/` (placeholder copy is a spec violation, not a stopgap).

## 9. Definition of Done (per story — paste into PR)

```
[ ] Acceptance criteria met
[ ] Responsive 360 / 768 / 1120+
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

## 11. Observability & analytics

Privacy-first analytics (Vercel Analytics or Plausible — no cookies, no consent banner
needed). Custom events: `case_study_read_depth` (25/50/75/100), `assistant_opened`,
`assistant_question`, `resume_downloaded`, `contact_clicked`. Error tracking: minimal
(Vercel logging is sufficient at this scale). Assistant route: log anonymized question +
latency + cost; never log IPs beyond rate-limit hashing.
