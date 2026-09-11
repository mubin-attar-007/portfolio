# Responsive interaction — motion refinement

11 September 2026. Production build: `bV5bfE014OIaq_sHkCs4F`.

The user requested an exploration of [Clerk](https://clerk.com/) and animation,
hover, and interaction improvements that make the existing portfolio feel alive.
This report supersedes report 10 for motion and the current build's checks.

## Reference and adaptation

Live inspection of Clerk's public homepage covered its navigation, component
switcher, and framework tiles. Observed patterns included soft hover surfaces,
moving component selections, and directional icon feedback. Reference captures
and computed interaction observations are under `.screenshots/clerk-motion/`.

The portfolio adapts these principles to its own light, typography-first system:

| Surface | Implemented behavior |
|---|---|
| Hero | One 8px arrival, fully opaque throughout, with no delay or scroll observer |
| Boundary inspector | A 300ms gliding selection surface; checks and outcome change immediately |
| Changed checks | Brief background emphasis and icon settle; unchanged SQL keeps its existing DOM node |
| Project previews | Linked images gently zoom within stationary frames; a permanent case-study label works on touch |
| Writing | Soft hover/focus surface and directional arrow; all copy remains stationary |
| Navigation | Soft surface and animated neutral rule; the actual current route keeps its accent rule |
| Shared controls | Directional arrows, animated underlines, one button sheen, and a 1px press response |

Reduced motion provides a still version of these interactions while preserving
state, destinations, and focus. New effects use CSS and existing tokens, with no
dependency, remote asset, API request, or artificial processing delay. Content,
measured evidence, résumé, assistant, and existing routes retain their sources.

## Files and maintenance

- `styles/tokens.css`, `styles/globals.css`: shared distances and enabled-control
  feedback, including reduced-motion guards and loading-icon exclusions.
- `components/home/boundary-inspector.tsx` and CSS: native radio state and finite,
  change-specific feedback; no SQL parsing or execution.
- `components/home/hero-stage.module.css`: finite full-opacity arrival.
- `components/work/project-card.tsx` and CSS: linked previews and static rows.
- `components/home/writing-and-now.tsx` and CSS: article-link feedback.
- `components/layout/nav-links.tsx` and CSS, shared button and text-link components:
  consistent interaction, current-route semantics, and focus treatment.
- `scripts/motion-audit.mjs`: samples transitions in flight and after settlement,
  then verifies rapid input, unchanged content, keyboard, touch, and reduced motion.
- ADR-017 and `design-system.md`: rationale and motion boundaries.

## Rendered checks

Production captures cover 390, 768, and 1440px in both themes, including the
selected inspector state and hovered project preview. Each render had zero
document overflow and zero browser errors. The hero, phone inspector, tablet
project row, and desktop hover/settled states were inspected visually.

Local evidence: `.screenshots/clerk-motion/production-*.png`,
`production-rendered.json`, and individual command logs. These artifacts are
ignored by Git. The permanent image label overlays the thumbnail's lower-right
corner; full demonstrations remain available on the case-study pages.

## Validation

All checks below ran against production build `bV5bfE014OIaq_sHkCs4F`:

| Check | Result |
|---|---|
| Build, TypeScript, ESLint | Pass |
| Unit/content/retrieval tests | 39/39 |
| Motion, hover/focus, rapid input, touch, reduced motion | 43/43 |
| Accessibility: 18 routes, three widths, two themes, open dialogs, keyboard | Zero violations |
| Boundary inspector, including no API requests and no-JavaScript defaults | 395/395 |
| Walkthrough first-input regressions | 3/3 |
| Walkthrough disclosure accessibility | 216/216 |
| General interactions, including no-JavaScript navigation and assistant | 60/60 |
| Deployment smoke checks | 33/33 |
| Links: 37 pages/assets, 1,065 references, 89 fragments | Zero broken destinations |
| Accent consistency: 14 routes per theme | No off-hue colors |
| Print: résumé chrome, contrast, visibility, PDF generation | Pass |

The motion audit is also included in the CI browser gate. It observes real
transition progress, including the selected surface's intermediate coordinates,
and verifies that the new decision is readable before the motion settles.

An initial no-JavaScript click timed out inside Playwright's actionability and
navigation waiting. A focused investigation found one document load, unchanged
document identity over ten seconds, no looping animation, and no resource stall.
After the entrance settled, an ordinary click completed in 68ms and the target
loaded 23ms after commit. The audit now waits for that finite entrance before
clicking, then separately checks the committed URL and visible destination.
No animation is disabled or forced to finish by this check.
Polling happens in Node because page timers do not resume when JavaScript is
disabled. The focused evidence is recorded in
`.screenshots/clerk-motion/reviewer-nojs-navigation-diagnostic.json`.

## Performance remains below budget

Final-build Lighthouse, one mobile run per route after the browser suites ended:

| Route | Performance | Accessibility / best practices / SEO | LCP | CLS | TBT |
|---|---:|---|---:|---:|---:|
| Home | 73 | 100 / 100 / 100 | 6.361s | 0 | 177ms |
| DBWhisper | 74 | 100 / 100 / 100 | 6.342s | 0 | 59ms |
| Writing article | 79 | 100 / 100 / 100 | 5.323s | 0 | 118ms |

The performance/LCP gates fail, and this run also exceeds the homepage TBT
budget. The social-preview, metadata-title, and indexing checks pass. Recorded
JavaScript transfer is 570KB home, 575KB DBWhisper, and 550KB writing, compared
with 569/575/550KB in report 10. These are local measurements, not hosted results.
No thresholds, throttling, or audit user agent were changed. The earlier report's
transport investigation remains relevant context, not evidence of a passing
performance score elsewhere. Full output: `.screenshots/clerk-motion/lighthouse.log`.

## Scope

No deployment was performed. The local production preview is
`http://127.0.0.1:3200`. Hosted performance and live model synthesis remain
unverified. The local performance budget remains unmet as recorded above.
