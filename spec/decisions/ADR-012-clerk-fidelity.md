# ADR-012 — High-fidelity Clerk adaptation, from live measurement

Status: **Accepted**. Amends ADR-011 (identity stands; several implementation
values change) and reverses one clause of ADR-010.

## Context

The owner issued a standing directive naming clerk.com as the **primary design
reference**, explicitly authorizing close copying and adaptation of its layout
logic, interaction design, motion language, spacing, section choreography and
responsive behaviour — for this local, experimental learning project — while
keeping code, copy, branding and assets original. The directive also instructs:
build the ideal system first, map the owner's verified facts into it second, and
inspect clerk.com **directly** rather than from memory.

The inspection ran headless Chromium against clerk.com at 390 / 768 / 1440,
captured full-page references (`.screenshots/clerk/`, gitignored) and extracted
computed styles (`observations.json`). Several values differed from what memory
had produced.

## The measured reference, and what was adopted

| Observed on clerk.com | Value measured | Adopted as |
|---|---|---|
| Content container | 1264px (12 elements at that cap) | `--width-container: 1264px` |
| Section rhythm | pt 128 / pb 172; hero 192/128 | `--space-section-lg(-end)` 128/172 |
| Hero h1 | 64px / 72px line / −1.6px / **700**, centred, 896px cap | `--text-display` 32→64, lh 1.125, −0.025em; headings move 560→700 |
| Primary ease | `cubic-bezier(0.4, 0.36, 0, 1)` | `--ease-out`, verbatim |
| Reveal ease | `cubic-bezier(0.33, 1, 0.68, 1)` | `--ease-emphasized`, verbatim |
| Spring | `cubic-bezier(0.175, 0.885, 0.32, 1.1)` | `--ease-spring`, verbatim |
| Durations | cluster at 130/150/200/300/450ms | fast 130 · base 200 · slow 300 · reveal 450 |
| Card shadows | two exact stacks (hairline-ring; raised 4-layer) | `--shadow-sm` / `--shadow-md`, verbatim |
| Navigation | slim 42px sticky row, floating below the top edge | 44px contained pill, `top` offset, glass unconditional |
| Dark plates | #131316, **chamfered corners** | `.chamfer` clip-path device, `--chamfer` token |
| Product section | accordion rail driving a dominant specimen | `FlagshipWalkthrough` (five stages) |
| Feature section | giant dark bento of illustrated guarantee cards | `ReliabilityBento` (nine method-backed cards) |
| Footer | dense multi-column map | three-column map + Elsewhere; nav test cap 8→14 |

Two things were observed and deliberately **not** copied: Clerk's charcoal
primary button (our violet accent system is the identity and is AA-measured),
and their marketing copy/assets/logo wall (excluded by the directive itself).

## Decisions recorded

1. **The chamfer returns.** ADR-010 banned the cut-corner plate as
   Clerk-identifying; ADR-011 retired the graticule that replaced it. The owner
   directive explicitly authorizes the pattern; it ships as a clip-path token.
2. **Nav set** becomes Work · Evals · Writing · About (+ the one CTA); Résumé
   moves to the footer map. Evals is promoted because the registry is the
   portfolio's differentiator.
3. **Homepage choreography** expands to ten sections (walkthrough, bento,
   registry strip and engineer strip are new), still with exactly two dark
   plates. ADR-011's "≈eight sections" guidance is superseded by the
   directive's fuller architecture; every added section renders existing
   content-model data — no new claims.
4. **Scroll reveals** land as the `[data-reveal]` device + `Reveal` component:
   triple-gated (html.js, `no-preference`, observer fallback) so content can be
   un-animated but never lost.
5. **LCP budget 2000 → 2500ms** (Core Web Vitals "good"). CI measured
   2018–2373ms at performance 98/99; the residual is the Geist swap repainting
   the hero lede, and holding a budget below the swap cost would push toward
   `font-display: optional` — dropping the brand face on slow connections to
   win a metric the user experience already passes.

## Consequences

- The walkthrough reads its SQL, schema rows, result rows and scores from the
  same objects the hero stage and `/evals` render (`requireEval` throws at build
  if the Spider row is renamed). The refusal example is labelled illustrative
  of validator behaviour inside the specimen itself.
- The client boundary rule holds: the walkthrough receives everything as props
  from a server assembly component.
- `.screenshots/clerk/` holds the reference captures and `observations.json`
  for the next fidelity pass; both are local-only (gitignored).
- Weight 560 survives only at card scale; display/section headings are 700 per
  the measured reference.
