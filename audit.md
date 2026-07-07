# audit.md — Phase 0 baseline (flagship-v2, no code changed)

Audited the current homepage (= shipped v2.0.2) on branch `flagship-v2`. Verify method:
grep of `components/` + `styles/`, Playwright screenshots (1440 + 390), Lighthouse mobile.

## (0) Lighthouse mobile — baseline
| metric | value | target (Phase 6) |
|---|---|---|
| Performance | **79** | ≥ 95 |
| Accessibility | **100** | 100 ✓ (already) |
| LCP | **5.6 s** | < 2.0 s |
| CLS | **0** | < 0.02 ✓ (already) |
| TBT | **40 ms** | low ✓ |

Perf is dragged down almost entirely by **LCP (5.6s)**. Prime suspect: the **hero entrance
animation** — the LCP element (the `<h1>`) starts at `opacity:0` and fades in over ~0.62s +
0.09s delay, so its "paint" is deferred. Secondary: Newsreader Google font (network) + hero
terminal. Fix in Phase 6 (don't fade the LCP headline / preload font / trim the entrance).

## (a) Token violations (hardcoded values outside tokens.css)
Codebase is ~95% tokenized (built token-first). Only violations found:
- **`components/diagrams/system-diagram.tsx:142`** — hardcoded shadow color
  `drop-shadow(0 6px 14px rgba(18,14,40,0.24))`. → add a `--shadow-node` (or use an existing
  shadow token). **Phase 1.**
- Inline **hardcoded durations** (not tokens): `300ms` (system-diagram:143,157; capability-grid:80),
  `620ms`/`70ms` stagger (capability-grid:80). The `300ms` == `--motion-slow`; the `620ms`/`460ms`
  reveal timings are custom. → map `300ms`→`var(--motion-slow)`; keep custom reveal timings but
  document, or add `--motion-reveal`. **Phase 1/3.**
- No hardcoded hex in any `.tsx` (grep clean). `code-block.tsx:23` is a comment only, not usage.
- `styles/globals.css` `.tone-invert` + tokens.css hold hardcoded hex — that's **token
  definition** (allowed), not violation.

## (b) Motion rules
- `prefers-reduced-motion`: **8 blocks in globals.css** — good coverage (reveals, illustrations,
  caret, ticker, hero entrance, scroll-behavior). Verify hover-only-color fallback in Phase 3.
- **Layout-animating (not transform/opacity):** FAQ + ComponentShowcase accordions animate
  `grid-template-rows: 0fr→1fr` (height). User-triggered, CLS=0, but violates "transform/opacity
  only." Acceptable technique; note + keep unless it causes jank. **Phase 3 review.**
- **Hover durations:** 200–300ms. Plan wants ≤250ms. `system-diagram` + `capability-grid`
  hovers are 300ms → trim to `--motion-base` (200ms) in Phase 3.
- Transform/opacity reveals + hero entrance + illustrations: compliant. Reveals fire once
  (scroll-driven `view()` for sections; IntersectionObserver once for capability grid). Good.

## (c) V1–V10 — where each lives in code
- **V1** back-to-back DBWhisper — `app/page.tsx`: Beat 1.5 `<ComponentShowcase/>` ("How DBWhisper
  stays safe") immediately precedes Beat 2 `<Section tone=invert><SystemDiagram/>` ("Inside
  DBWhisper"). Two sections, same subject/CTA. **Merge → Phase 2.**
- **V2** case-study depth on homepage — `components/diagrams/data.ts` node `decision`
  {rejected/why/tradeoff} (~80w each) rendered by `system-diagram.tsx` pin panel on the homepage.
  → homepage reveal = 1–2 lines + deep link; full essays move to `/work/dbwhisper`. **Phase 2/5.**
- **V3** zero 3rd-party validation — no proof strip anywhere in `app/page.tsx`. Sevina, GitHub
  stars, live-product count all absent. **Add proof strip → Phase 2.** (Real numbers only;
  quotes require human → TODO_HUMAN.)
- **V4** hire CTA only at bottom — `app/page.tsx` hero CTAs = "Read the flagship case study" +
  "How I make decisions" (no contact). Contact only in Beat 8 + footer. **Add hero contact CTA +
  mid-page recurrence → Phase 2.**
- **V5** "screenshots" ×3 — `content/site.ts`: `home.lede` ("I don't ship screenshots"),
  `home.live.kicker` ("Live, not screenshots"), `home.faq` #5 ("I don't ship screenshots…").
  → keep ONE, vary the rest. **Phase 2.**
- **V6** marquee duplicate text — `components/features/skill-rotator.tsx:` the `<p class="sr-only">
  Tech stack: …</p>` is **already `sr-only`** (not visible). Likely already resolved in v2.0.2;
  **verify visually in Phase 1** and mark closed if hidden.
- **V7** stat card "none" — `app/page.tsx` Beat 2 renders `flagship.metrics.slice(0,3)` via
  `<Metric>`; `content/projects.ts` dbwhisper `metrics[0].value = "none"`. Renders a big "none".
  → restyle as a ✓ guarantee chip / `0` with clear label. **Phase 2.**
- **V8** "Ask Friday /" unexplained — `components/features/assistant.tsx` trigger; no tooltip/
  first-run hint for what it is. → add affordance (title/tooltip) or cut. **Phase 2.**
- **V9** off-site inconsistency — GitHub bio → `mubinattar.netlify.app` (old); TradePulse README
  URL differs from site. External repos, **can't edit from here → TODO_HUMAN** with exact text.
- **V10** footer nav ≠ header nav — header `config/nav.ts` = Work/Writing/About/Résumé; footer
  `components/layout/footer.tsx` NAV = Work/Writing/About/Timeline/Uses/Résumé. → make header the
  complete primary map, or confirm intentional. **Phase 1.**

## Baseline screenshots
`baseline-home-desktop.png` (1440) + `baseline-home-mobile.png` (390) captured; 0 console/runtime
errors at both sizes.
