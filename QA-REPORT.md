# QA-REPORT — Flagship enhancement pass

Measured evidence for the brief's §18 gate. Numbers are real runs, not assertions.
Where a number can't be measured trustworthily in this environment, it says so
plainly rather than claiming a pass.

> **Design-elevation pass (dark-first, owner-directed).** After the flagship pass
> below, the identity was pushed to a Linear-caliber bar at the owner's direction:
> **dark by default** (light on the toggle), a **layered depth system**
> (`--shadow-surface`, hero accent glow, cards that lift on hover), **~25% denser**
> section rhythm, **refined (smaller) display headings**, and **more visual
> anchors** — the home "Selected systems" section is now elevated product cards,
> `/work`'s flagship is a two-column with an architecture panel, and `/evals` is a
> scannable scoreboard of result cards instead of a dense table. Re-verified:
> `next build` ✓ (67 pages), `npm test` 34/34 ✓, `eslint` 0, `tsc` 0, and **axe:
> 0 violations in BOTH themes** across home / work / about / evals (contrast holds
> on every new dark surface incl. the `#0d0d10` recessed feature-band well). The
> §18 checklist below still holds; the full 21-route axe gate should be re-run in
> CI to re-bless every route under the new dark default.

**Test environment:** local `next start` (production Turbopack build, Next 16.2.11),
Playwright + axe-core, Lighthouse 13.4.1 (mobile profile: 4× CPU throttle + slow-4G,
applied even on localhost). Windows, machine shared with the build tooling.

---

## Automated gates — all green

| Gate | Result | Evidence |
|---|---|---|
| `next build` | ✅ pass | clean compile; all routes prerender; `/talks` `/timeline` `/changelog` gone |
| `npm test` (node:test) | ✅ 34/34 | content-law, retrieval-grounding, navigation, feed, format |
| `eslint .` | ✅ 0 problems | — |
| `tsc --noEmit` (strict) | ✅ 0 errors | no `any`, no non-null escapes, no shipped `console` |
| **axe WCAG 2.2 AA** | ✅ **0 violations** | `scripts/a11y.mjs`: **21 routes × 6 passes** (light/dark × desktop/tablet/mobile) + assistant + mobile-nav overlays + reduced-motion + keyboard focus-traps |

## Lighthouse (median of 3, mobile, local `next start`)

| Route | Perf | **A11y** | **Best-pract.** | **SEO** | CLS | TBT | LCP | first-load JS |
|---|---|---|---|---|---|---|---|---|
| `/` (home) | 79–86† | **100** | **100** | **100** | 0.000 | 66–88ms | 4.1–5.4s† | ~180KB gz‡ |
| `/work/dbwhisper` | 76† | **100** | **100** | **100** | 0.000 | 30–41ms | 6.0s† | ~180KB gz‡ |
| `/writing/…` | 79–80† | **100** | **100** | **100** | 0.000 | 56–87ms | 5.3s† | ~180KB gz‡ |

**A11y, best-practices, SEO = 100 on every route. CLS = 0.000. TBT well under the
150ms budget.**

† **Performance score and LCP are environment-limited here and are NOT a trustworthy
pass/fail.** Local `next start` has no CDN, no HTTP/2 edge, and no Brotli, and
Lighthouse's mobile profile simulates slow-4G + 4× CPU on top of a machine also
running the build tooling. Under that simulation an App-Router site's framework JS
alone pushes LCP past the 2.0s budget. These must be re-measured on the real deploy
(Cloudflare/Vercel CDN) or a clean CI runner before claiming a perf number. **What is
established:** the change in this pass did **not** regress LCP — the hero `<h1>` is the
LCP element and is server-rendered; the new workbench is server-rendered beside it
(not the LCP element) and added CLS 0.000.

‡ **First-load JS ≈ 651KB decoded / ~180KB gzipped, and it is framework-dominated:**
the identical large shared chunks (227/144/110KB decoded) load on `/writing`, which
has **zero page-specific client JS and no workbench** — so the workbench did not bloat
the bundle. This exceeds the aspirational ≤120KB budget (which the prior audit
confirmed was documented but never measured). The new gate in
`scripts/lighthouse-budget.mjs` now **measures and prints** this on every run and flags
it over-target, but is **advisory (non-failing)**: hard-failing CI on a pre-existing,
framework-dominated, compression-sensitive floor would red-CI on something outside this
pass's scope. Driving it toward budget is tracked in `NEEDS-INPUT.md`.

## Contrast (measured, WCAG 2.x)

Every foreground/background pair used in the UI is listed with its ratio in
`design-system.md §2`. The re-forged **signal-teal accent** clears AA (≥4.5:1) on every
surface in light, dark, and dark-band contexts, with margin: 6.07:1 (accent/white),
5.24:1 (accent/bg-subtle, the tightest), 9.58:1 (dark accent/dark bg). Verified again
end-to-end by the axe run above (axe includes contrast checks) — 0 contrast violations.

## §18 checklist

- [x] Renders at the §7 widths, both orientations, 200% text — axe runs at 360/768/1280 × light/dark with a horizontal-overflow assertion (WCAG 1.4.10); 0 failures
- [x] Zero horizontal overflow / overlap / clipped content — asserted per route in `a11y.mjs`
- [x] Every interactive element: hover / active / focus-visible / disabled / **loading** — button now covers all five (gallery at `/dev/components`)
- [x] Keyboard-only pass end to end — `a11y.mjs` focus-trap + focus-restore assertions on the assistant + mobile-nav
- [x] Screen-reader semantics — one `<h1>`/page, landmarks, `aria-current`, dialog `aria-modal`/labelledby, live regions (axe-verified)
- [x] axe: **0 violations** · Lighthouse a11y: **100**
- [x] All contrast pairs listed with measured ratios (`design-system.md §2`)
- [x] `prefers-reduced-motion` verified — reduced-motion pass: durations collapse, entrance content stays visible
- [~] Core Web Vitals vs budgets — CLS 0.000 ✅, TBT <150ms ✅; **LCP/perf need the real CDN environment** (see †)
- [~] Bundle size vs budget — measured (~180KB gz), over the 120KB aspiration; advisory gate (see ‡)
- [x] Lighthouse mobile — a11y **100**, best-practices **100**, SEO **100**; perf pending real-env (†)
- [x] Metadata, OG image, JSON-LD per route — social-preview + metadata gates PASS; `BreadcrumbList` added
- [x] Sitemap, robots, canonicals, redirects — redirect-integrity gate PASS (308 → correct targets; removed routes absent from sitemap)
- [x] Typecheck, lint, format clean · no console errors
- [x] Every token-system violation listed or fixed — drift resolved (§CHANGES 3)
- [x] Every `[NEEDS INPUT]` listed — `NEEDS-INPUT.md`
- [~] Cross-browser — verified Chromium (Playwright/Lighthouse); Safari/Firefox/mobile not run in this environment
- [x] Dark and light both reviewed — every axe pass and the contrast table cover both
- [x] Chanel test — the static hero `systemFigure` was removed once the workbench carried the argument; the flagship band lost its duplicate pipeline

## Known-not-done (honest list)

- Perf score / LCP need a trustworthy measurement on the real deploy or a clean CI runner.
- First-load JS exceeds the 120KB aspiration (pre-existing framework floor); optimization is a separate task.
- Cross-browser beyond Chromium not exercised here.
- The `.tsx`-vs-`.mdx` case-study duplication (audit item) was intentionally deferred — see `NEEDS-INPUT.md`.
