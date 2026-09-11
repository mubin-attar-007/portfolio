# Inspectable engineering — flagship refinement

11 September 2026. Final production build: `XI8RGQXRkAZO4NxaP-Lqp`.

This report supersedes report 09 for the homepage composition and current checks.
The implementation received independent Astra ultra design and evidence reviews.

## Result

The homepage has one signature interaction: a DBWhisper boundary inspector.
Readers choose a read query, a SELECT INTO write, or a missing schema index.
The statement, illustrated checks, and eligible/refused result remain adjacent.
Cases are predefined and labeled; no SQL parser, API, model, or database runs.
Measured 18/22 golden-query matches and 4/4 unsafe-prompt refusals stay in a
separate footer, with the actual evaluation date and method link.

The five-stage request walkthrough is preserved at
`/work/dbwhisper#request-walkthrough`, including play/pause/replay, focus pause,
manual selection, and reduced-motion support. The query now uses January–April
2024 consistently with its four explicitly illustrative result rows.

Shared project rows explain TradePulse's execution timing, CrownWager's
evaluation method, and LLM Studio's ownership scoping. They use canonical
metric methods, ordinary links, accurate capture labels, and intrinsic lazy
images. There are no lifting cards or fabricated browser addresses.

Professional information, all four projects, the résumé, assistant, writing,
evaluation registry, theme preference, and navigation remain available.

## Significant files

- `components/home/boundary-inspector.tsx` and its CSS: native radio selection,
  named outcome region, concise user-triggered announcement, responsive layout.
- `content/dbwhisper-boundary.ts`: finite policy illustrations, separate from
  production validation and published evaluations.
- `components/case-studies/request-walkthrough.tsx`, `walkthrough.tsx`, and
  `content/dbwhisper-walkthrough.ts`: relocated request path and sample data.
- `components/work/project-card.tsx`, its CSS, `content/projects.ts`, and schema:
  editorial project rows and honest capture metadata.
- `public/demos/*.vtt`: corrected claims and timings for all four recordings.
- `scripts/boundary-audit.mjs`: interaction, keyboard, no-JavaScript, reduced
  motion, API-request prevention, and responsive accessibility checks.
- `scripts/walkthrough-disclosure-audit.mjs`: only the expanded stage is exposed
  to assistive technology; collapsed stage text is explicitly hidden.
- ADR-016 and `design-system.md`: current design rationale and contracts.

## Rendered verification

Production renders were inspected at 390×844, 768×1024, 1024×768, 1440×900,
1920×1080, and 844×390 in both themes. All images loaded and no horizontal
document overflow was detected. The complete inspector fits the first desktop
viewport. On a phone, its controls and refused result fit together after the
reader scrolls to the controls.

| Viewport width | Previous pass page height | Current height |
|---|---:|---:|
| 390 | 8,714 | 7,517 |
| 768 | 8,410 | 5,597 |
| 1440 | 5,166 | 4,787 |
| 1920 | 5,217 | 4,787 |

Evidence is in `.screenshots/flagship-v2/`: production captures, rendered-checks
JSON, and individual command logs. These local artifacts are ignored by Git.

## Checks

- Production build, TypeScript, and ESLint: pass; 39 unit/content/retrieval tests pass.
- General interaction contracts: 60/60; delayed-arrival input regressions: 3/3.
- Boundary inspector: 395/395 assertions, including 24 case/theme/viewport axe
  scans with zero violations, native keyboard selection, no API requests, and
  JavaScript-disabled defaults.
- Site-wide accessibility: zero violations across 18 routes, three viewport
  sizes, both themes, and open navigation/assistant states.
- Final disclosure accessibility: 216/216 assertions across five stages,
  three widths, both themes, and both motion preferences.
- Final deployment smoke checks: 33/33.
- Link crawl: 37 pages/assets, 1,059 link references, 89 fragment references,
  zero broken destinations.

The full interaction/accessibility matrix and captures ran on build
`xkdPnQaZsDH2ig2sLtTy3`. A subsequent accessibility review found that collapsed
walkthrough regions remained exposed to screen readers. The final build adds
`aria-hidden` to collapsed regions, with no visual change; the dedicated 216-case
disclosure check and full smoke check passed against that final build.

## Performance remains below budget

Final-build Lighthouse, one mobile run per route, after other browser jobs ended:

| Route | Performance | Accessibility / best practices / SEO | LCP | CLS | TBT |
|---|---:|---|---:|---:|---:|
| Home | 76 | 100 / 100 / 100 | 6.184s | 0 | 66ms |
| DBWhisper | 75 | 100 / 100 / 100 | 6.381s | 0 | 66ms |
| Writing | 80 | 100 / 100 / 100 | 5.183s | 0 | 105ms |

The performance/LCP gate fails. Social previews, page titles, and indexing gates
pass. Recorded JavaScript transfer is 569KB home, 575KB DBWhisper, 550KB writing.
The local transport issue documented in report 09 affects browser transfer
accounting; it does not establish a passing score elsewhere. No thresholds,
throttling, or audit user agent were changed. Hosted performance and live model
synthesis remain unverified. This refinement adds no dependency or service.

A read-only final-build probe reconfirmed the discrepancy: the same JavaScript
chunk was 9,272 gzip bytes for a basic HTTP client and 44,839 decoded bytes for a
Chrome user agent, with `x-content-encoding-over-network: gzip` injected into the
latter response. See `transport-final.json`; this probe was separate from the
unchanged Lighthouse runs.

## Asset limitations

DBWhisper, TradePulse, and CrownWager recordings show their product websites.
LLM Studio shows the actual chat interface. Captions and image alternatives now
describe these accurately. Known obsolete claims embedded in the older video
pixels cannot be repaired by subtitle edits; the visible figure captions identify
the discrepancy and point readers to the current documented methods. All 30 VTT
cues parsed in Chromium without overlap or duration overrun.

No deployment was performed. The preview is a local production server at
`http://127.0.0.1:3200`. Run development with `npm run dev`; use the established
Vercel deployment instructions in report 09 to preserve `/api/chat`.
