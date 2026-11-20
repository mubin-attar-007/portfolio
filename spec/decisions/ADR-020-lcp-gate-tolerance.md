# ADR-020 — The LCP gate: a 2.5 s target, a 2.7 s limit, five runs

Status: **Accepted**, 18 November 2026 (owner's decision). Amends the LCP row of
`spec/ENGINEERING.md` §5 and the Lighthouse step of the CI gate; ADR-018's
2.0 → 2.5 s re-baseline stays the history this record continues.

## Context

The CI gate fails a build when the median Lighthouse LCP of `/`, `/work/dbwhisper`
or the writing page passes its limit. Lighthouse does not time LCP; it simulates it
(Lantern) from one fast local load, and two properties of that simulation made a
limit set at the 2.5 s target fail on noise rather than on regressions:

- **Steps.** The simulated network moves in TCP round trips, so the result moves in
  ~75 ms quanta: removing 13 KB of script on the case study changed nothing, a
  little more moved it a whole step.
- **The bootstrap race.** A script is charged only when its evaluation started
  before the observed first paint. Whether react-dom (72 KB) wins that race varies
  run to run, and losing it adds about 600 ms: a docs-only commit read 2822 ms on the
  writing page after 2195 ms the run before.

After the font and CSS work recorded in ENGINEERING.md §5, CI measured home 2567 ms
and the case study 2565 ms at performance 97, and the real Vercel preview priced the
same pages at 2431 and ~2500 ms. What remains is framework JavaScript. Splitting the
case study's below-the-fold components into lazily hydrated islands was built and
measured: it saved about 6 KB, and React streamed the islands out of line in the
prerendered HTML (a gap, then a swap), so it was reverted.

## Decision

1. **The target stays 2.5 s** (the Core Web Vitals "good" threshold). A median above
   it prints a CI warning naming the page, so drift is visible on every pull request.
2. **The gate fails above 2.7 s**, two simulation steps of headroom.
3. **Five runs per page, not three**, so one lost race is outvoted.
4. Nothing else loosens: performance ≥ 95 (which by itself fails a page whose LCP
   reaches about 2.9 s), CLS < 0.05 and TBT < 150 ms stay hard limits.

## Consequences

- A real regression (a new dependency in the first load, a render-blocking request)
  still fails; noise no longer blocks a merge.
- A lost race in three of five runs can still fail the writing page; that is a
  signal to cut first-load script, not to raise the limit again.
- CI takes about two minutes longer.
- Raising the limit past 2.7 s needs a new record.

## Amendment, 20 November 2026: one re-measurement before a failure

A pull request that changed only a URL string failed on the writing page at 2806 ms;
the re-run of the same commit read 2194 ms. The median of five runs had still lost
to a slow runner. A route over any budget is now measured once more, with a fresh set
of five runs, and fails the build only if the second set fails too
(`scripts/lighthouse-budget.mjs`). The limits are unchanged, and a real regression
fails both sets. The re-measurement prints a CI warning naming the route, so a page
that keeps needing it is visible.
