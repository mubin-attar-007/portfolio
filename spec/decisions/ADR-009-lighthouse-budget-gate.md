# ADR-009 — Lighthouse budget gate

**Status:** Accepted
**Date:** 2026-07-24 (facts updated 2026-11-13)

## Context

`ENGINEERING.md` requires Lighthouse on the home page, flagship case study, and
one writing route, with minimum category scores of 95/100/100/100 and explicit
LCP, CLS, and TBT budgets. The repository previously described that contract but
did not execute it in CI. Social image URLs could therefore return 404 while the
build and accessibility checks remained green.

## Decision

Use the official `lighthouse` CLI as an exact, development-only dependency
(`lighthouse@13.4.1` in `devDependencies`) and run it through
`scripts/lighthouse-budget.mjs`.

The gate:

- audits `/`, `/work/dbwhisper`, and
  `/writing/a-validator-is-not-a-better-prompt`;
- uses Lighthouse's mobile form factor and simulated mobile throttling;
- takes the median of three runs per route (`LIGHTHOUSE_RUNS`, at most 5);
- enforces Performance ≥ 95, Accessibility = 100, Best Practices = 100, and
  SEO = 100;
- enforces LCP ≤ 2,500 ms, CLS < 0.05, and TBT < 150 ms. LCP was re-baselined
  from 2,000 ms to the Core Web Vitals "good" threshold (ADR-012, decision 2);
- prints first-load JavaScript against targets of 120 KB (home) and 90 KB
  (flagship, writing) as an advisory figure, not a failure;
- before auditing, verifies canonical URLs, Open Graph/Twitter image metadata and
  live images, the exact titles of `/`, `/trust`, and `/privacy`, that `/talks`,
  `/timeline`, and `/changelog` permanently redirect and are absent from the
  sitemap, and that sitemap freshness comes only from dated content.

`npm run test:metadata` runs only those pre-audit checks. The script starts its own
standalone server from the build unless `LIGHTHOUSE_BASE_URL` points at one.

INP remains a field metric. A navigation-only lab run cannot produce a
representative INP value without a defined interaction journey, so the
`< 200 ms` contract remains a production/RUM check rather than a fabricated
Lighthouse assertion.

## Dependency review

- Package: `lighthouse@13.4.1` (exact)
- Scope: development and CI only; it is absent from production route bundles
- Size: large, accepted only in development because it provides Chrome trace
  collection and the official scoring implementation

`@lhci/cli` was not selected: at the time its package embedded Lighthouse 12.6.1,
while the official Lighthouse package is actively maintained and lets this
repository keep its small, explicit assertion runner. A hosted third-party
action was also avoided so the same command works locally and in CI.

## Consequences

CI runs nine throttled audits on pushes to `main` and on pull requests that target
`main`. Performance regressions fail before merge, and failed reports remain
ephemeral rather than being uploaded to a third party. Developers run:

```bash
npm run build
npm run test:metadata   # fast social/canonical/indexing check
npm run test:lighthouse
```

Set `LIGHTHOUSE_RUNS=1` only for a local smoke check; CI keeps the three-run
median. Local runs on a loaded machine can score far below CI;
`npm run test:lh-diagnose` explains the gap.
