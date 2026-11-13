# ADR-012 — High-fidelity Clerk adaptation, from live measurement

Status: **Accepted, partly superseded.** Trimmed on 2026-11-13 to the parts that still
govern the code: the measured layout and motion values, the navigation set, the footer
map, and the LCP budget. Its homepage choreography (ten sections, notched "chamfer"
dark plates, the reliability bento, the pill navigation, the walkthrough on the
homepage, the no-op reveal component) was superseded by ADR-015, ADR-016 and ADR-017;
the full original text is in git history at commit `8949fdf`.

## Context

The owner issued a standing directive naming clerk.com as the **primary design
reference**, explicitly authorizing close copying and adaptation of its layout
logic, interaction design, motion language, spacing, section choreography and
responsive behaviour — for this local, experimental learning project — while
keeping code, copy, branding and assets original. The directive also instructs:
build the ideal system first, map the owner's verified facts into it second, and
inspect clerk.com **directly** rather than from memory.

The inspection ran headless Chromium against clerk.com at 390 / 768 / 1440 and
extracted computed styles. Reference captures went to `.screenshots/clerk/`
(local-only, gitignored); they are not in the repository.

## The measured reference, and what is still adopted

| Observed on clerk.com | Value measured | Adopted as (current `tokens.css`) |
|---|---|---|
| Content container | 1264px (12 elements at that cap) | `--width-container: 1264px` |
| Section rhythm | pt 128 / pb 172 | `--space-section-lg` / `-lg-end`, clamped up to 128 / 172px |
| Primary ease | `cubic-bezier(0.4, 0.36, 0, 1)` | `--ease-out`, verbatim |
| Reveal ease | `cubic-bezier(0.33, 1, 0.68, 1)` | `--ease-emphasized`, verbatim |
| Spring | `cubic-bezier(0.175, 0.885, 0.32, 1.1)` | `--ease-spring`, verbatim |
| Durations | cluster at 130/150/200/300/450ms | fast 130 · base 200 · slow 300 · reveal 450 |
| Card shadows | two exact stacks (hairline-ring; raised 4-layer) | `--shadow-sm` / `--shadow-md`, verbatim |
| Product section | accordion rail driving a dominant specimen | the five-stage walkthrough, now on `/work/dbwhisper` (ADR-016) |
| Footer | dense multi-column map | three-column map + Elsewhere; footer link cap raised 8 → 14 |

Two things were observed and deliberately **not** copied: Clerk's charcoal
primary button (our violet accent system is the identity and is AA-measured),
and their marketing copy/assets/logo wall (excluded by the directive itself).

## Decisions still in force

1. **Nav set** becomes Work · Evals · Writing · About (+ the one CTA); Résumé
   moves to the footer map. Evals is promoted because the registry is the
   portfolio's differentiator. (`config/nav.ts`; the ≤ 14 footer-link cap is
   asserted by `test/navigation.test.mts`.)
2. **LCP budget 2000 → 2500ms** (Core Web Vitals "good"). CI measured
   2018–2373ms at performance 98/99; the residual is the Geist swap repainting
   the hero lede, and holding a budget below the swap cost would push toward
   `font-display: optional` — dropping the brand face on slow connections to
   win a metric the user experience already passes. (`scripts/lighthouse-budget.mjs`,
   ADR-009.)

## Consequences

- The walkthrough reads its sample SQL, schema rows and result rows from
  `content/dbwhisper-walkthrough.ts` and its scores from `content/evals.ts`
  (`requireEval` throws at build if the Spider row is renamed). The refusal example
  is labelled illustrative of validator behaviour inside the specimen itself.
- The client boundary rule holds: the walkthrough receives everything as props
  from a server assembly component (`components/case-studies/request-walkthrough.tsx`).
- Page titles (`PageHeader`) use weight 700 per the measured reference; the homepage
  display headline was later set to 550 (design-system.md §3).
