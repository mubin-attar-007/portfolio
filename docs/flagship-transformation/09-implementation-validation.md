# Implementation and verification — 11 September 2026

The redesign is implemented in the existing Next.js application. The production
preview runs at `http://127.0.0.1:3200`. No public deployment was performed.

## Design and implementation

Light editorial typography, a compact personal introduction, and an explicitly
illustrative DBWhisper architecture figure establish the opening. Scoped
evaluation counts lead into selected projects, one interactive workflow,
professional experience, writing, and contact. Dark mode remains available.

The homepage measured 5,166px tall at 1440px and 8,714px at 390px, compared with
8,834px and 13,912px before this pass. Detailed project content remains on its
original routes.

Principal changes:

- `app/page.tsx`, `components/home/`, and `styles/`: new composition, shorter
  sections, always-visible homepage content, and removal of redundant surfaces.
- `config/site.ts`, `content/`, and `lib/ai/retrieval.ts`: canonical Applied AI
  Engineer identity, preserved employment facts, scoped claims, and shared typed
  project/résumé records. Removed obsolete JSON duplicates.
- `components/features/`, `components/layout/mobile-nav.tsx`, and
  `lib/use-inert-background.ts`: linked assistant sources, preserved drafts,
  modal focus/scroll isolation, menu handoff, and resilient theme preferences.
- `components/home/walkthrough.tsx`: early click or keyboard input takes priority
  over a delayed autoplay callback; playback, pause, replay, and reduced-motion
  behavior remain functional.
- `public/Mubin_Attar_Resume.pdf`: regenerated from canonical résumé content and
  visually verified as one A4 page.
- `scripts/`, `.env.example`, `README.md`, `design-system.md`, and ADR-015:
  regression coverage, reproducible configuration, and current documentation.

## Verification

Final production build ID: `FGRFN_miuf3vJYUoa1mc9`.

| Check | Result |
| --- | --- |
| `npx tsc --noEmit`, `npm run lint`, `npm run build` | Pass |
| `npm test` | 39/39 pass |
| `npm run test:interaction` | 58 general + 3 first-input regressions pass |
| `npm run test:smoke` | 33/33 pass |
| `npm run test:links` | 37 pages/assets, 1,053 links, 85 fragments; zero broken destinations |
| `npm run test:a11y` | Zero violations across 18 routes, both themes, three viewport sizes, and dialog states |
| Final homepage axe check after the input fix | Zero violations or overflow in both themes at 390×844, 768×1024, 1440×900, and 1920×1080 |
| `npm run test:screens` | 72 captures across six key routes, six sizes, and two themes; zero overflow or console errors |
| `npm run test:hue`, both themes | Pass across 14 routes |
| `npm run test:print`, `npm run test:metadata` | Pass |
| Project live/source links | All eight returned HTTP 200 |

Rendered screenshots were inspected at the requested sizes and in landscape,
including the homepage sections, contact page, and DBWhisper case study.
Evidence files are under the ignored `.screenshots/review/` directory. The full
route sweep preceded the final autoplay guard; the changed homepage and
interaction contracts were checked again on the final build.

## Remaining validation limits

The final local Lighthouse gate **fails performance and LCP budgets**:

| Route | Performance | Accessibility / Best practices / SEO | LCP | CLS |
| --- | --- | --- | --- | --- |
| Home | 76 | 100 / 100 / 100 | 6.216s | 0 |
| DBWhisper | 80 | 100 / 100 / 100 | 5.120s | 0 |
| Writing | 79 | 100 / 100 / 100 | 5.328s | 0 |

Read-only HTTP diagnostics found browser requests receiving decoded assets with
an injected `x-content-encoding-over-network: gzip` header. The same JavaScript
asset arrived as 232,565 bytes for a Chrome user agent and 72,644 gzip bytes for
a basic HTTP client. This inflates local transfer accounting; the server already
enables compression. It does not establish a passing hosted score. Scores,
throttling, and budget thresholds were left unchanged. Recheck the hosted build.

Live Gemini synthesis, newsletter submissions, and booking completion were not
exercised. A real API request verified the HTTP/SSE refusal path before any model
call; controlled SSE fixtures verified streaming interaction behavior.

## Run and deploy

Use Node 24 or later, from the repository directory:

```powershell
npm ci
npm run dev
```

For optional model synthesis, copy `.env.example` to `.env.local` only if that
file does not already exist, then set `GEMINI_API_KEY`. Keep credentials private.

To deploy the complete application to the existing Vercel project:

```powershell
npx vercel link
npx vercel --prod
```

During linking, select the existing project serving `mubin-attar.vercel.app`.
Configure the optional server-side model key in that project's environment
settings. After deployment, run:

```powershell
$env:BASE_URL='https://mubin-attar.vercel.app'
npm run test:smoke
```

The existing Sites staging script emits a static version; Vercel is the complete
runtime target for `/api/chat`. Publishing and changes to hosting access were
outside this implementation. See `DEPLOY.md` for the existing hosting details.
