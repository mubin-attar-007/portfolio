# 05 Technical Quality Baseline

## Commands Executed
- `npm run build`  -> PASS
- `npx tsc --noEmit` -> PASS
- `npm run lint` -> FAIL (temporary repo files `tmp_perf_open.js`, `tmp_responsive_probe.js`, `tmp_urls.js` containing `require()` imports)
- `npm test` -> PASS (34 tests, 0 failures)
- `npm run test:metadata` -> PASS
- `npm run test:a11y` -> FAIL (requires local server at `http://localhost:3200/`)
- `npm run test:lighthouse` -> FAIL (performance/LCP/JS budgets)

## Focused route performance probes (supplementary)

- `/resume` (live Lighthouse one-off run): performance=100, accessibility=100, best-practices=100, seo=100, LCP=738.33ms, CLS=0.0003, TBT=2ms.
- `/hire` (live Lighthouse one-off run): performance=100, accessibility=100, best-practices=100, seo=100, LCP=577.17ms, CLS=0.00004, TBT=0ms.
- The one-off command for `/resume` and `/hire` showed an `EPERM` temp-directory cleanup warning from lighthouse CLI on the second invocation; scores were still written to JSON and parsed for both routes.

## Detailed Lighthouse baseline (`test:lighthouse`)
- Home: performance=78, accessibility=100, best-practices=100, seo=100, LCP=5451ms, CLS=0, TBT=85ms, JS=551KB (target miss on performance and JS)
- Work flagship (`/work/dbwhisper`): performance=82, accessibility=100, best-practices=100, seo=100, LCP=4557ms, CLS=0, TBT=46ms, JS=561KB (target miss on performance and JS)
- Writing flagship article (`/writing/a-validator-is-not-a-better-prompt`): performance=79, accessibility=100, best-practices=100, seo=100, LCP=5309ms, CLS=0, TBT=98ms, JS=546KB (target miss on performance and JS)
- Metadata and social image checks from same run are passing.

## API and route checks
- `GET /api/chat` => 405 (expected)
- `POST /api/chat` with JSON payload => 200
- `GET /api/ask` => 404

## Route status probes
- Source route set: mostly returning 200 on live site; GET probing found:
  - `/contact`: 404
  - `/home`: 404
  - `/timeline`: 200
  - `/talks`: 200
  - `/changelog`: 200

## Observed regressions from local checks
- Build lock issue (`EBUSY .next/standalone`) can recur when stale dev processes remain.
- `npm run lint` failure is currently environmental-to-repo-quality coupling because of temp probe artifacts; baseline result should be rerun once those files are excluded or cleaned.
