# ADR-009 — Lighthouse budget gate

**Status:** Accepted  
**Date:** 2026-07-24

## Context

`ENGINEERING.md` requires Lighthouse on the home page, flagship case study, and
one writing route, with minimum category scores of 95/100/100/100 and explicit
LCP, CLS, and TBT budgets. The repository previously described that contract but
did not execute it in CI. Social image URLs could therefore return 404 while the
build and accessibility checks remained green.

## Decision

Use the official `lighthouse` CLI as an exact, development-only dependency and
run it through `scripts/lighthouse-budget.mjs`.

The gate:

- audits `/`, `/work/dbwhisper`, and
  `/writing/a-validator-is-not-a-better-prompt`;
- uses Lighthouse's mobile form factor and simulated mobile throttling;
- takes the median of three runs per route;
- enforces Performance ≥ 95, Accessibility = 100, Best Practices = 100, and
  SEO = 100;
- enforces LCP ≤ 2,000 ms, CLS < 0.05, and TBT < 150 ms;
- verifies canonical URLs and live Open Graph/Twitter images before auditing;
- verifies that the empty Talks route is `noindex` and absent from the sitemap.

INP remains a field metric. A navigation-only lab run cannot produce a
representative INP value without a defined interaction journey, so the
`< 200 ms` contract remains a production/RUM check rather than a fabricated
Lighthouse assertion.

## Dependency review

- Package: `lighthouse@13.4.1` (exact)
- Scope: development and CI only; it is absent from production route bundles
- Maintenance check: npm published the current release on 2026-07-21
- Size check: npm reports 18,983,250 bytes unpacked; the cost is accepted only
  in development because it provides Chrome trace collection and the official
  scoring implementation

`@lhci/cli` was not selected: its current package embeds Lighthouse 12.6.1,
while the official Lighthouse package is actively maintained and lets this
repository keep its small, explicit assertion runner. A hosted third-party
action was also avoided so the same command works locally and in CI.

## Consequences

CI takes longer because it runs nine throttled audits. Performance regressions
now fail before merge, and failed reports remain ephemeral rather than being
uploaded to a third party. Developers run:

```bash
npm run build
npm run test:metadata   # fast social/canonical/indexing check
npm run test:lighthouse
```

Set `LIGHTHOUSE_RUNS=1` only for a local smoke check; CI keeps the three-run
median.
