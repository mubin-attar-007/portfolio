# ADR-010 — The ember console identity: Clerk-caliber, not Clerk-derivative

Status: Accepted (supersedes the anti-thesis in design-system.md §1 and amends
spec/DESIGN.md §9)

## Context

The owner directed a full redesign of the personal brand site, naming
**clerk.com as the primary design inspiration**, and asked explicitly for a
premium, highly interactive, AI-first, dark-first result: scroll reveals,
staggered entrances, magnetic buttons, animated gradients, glow effects,
background motion, subtle parallax, page transitions, and tasteful cursor
interaction. The brief also instructed that the existing site be treated **only
as a source of content**, and that anything mediocre be replaced rather than
preserved.

Three checked-in documents contradicted that brief:

1. **design-system.md §1** named Clerk-copying as the explicit *anti-thesis*:
   "the previous system was a faithful copy of clerk.com's palette, easing, and
   section device… any reviewer could name the source."
2. **spec/DESIGN.md §9**, under a heading reading *"Anti-patterns — BANNED (this
   section is law)"*, banned parallax, cursor followers, looping ambient
   animation, marquees, typing effects, spotlight cursors, and tilt cards — and
   separately banned a full-dark default theme.
3. **styles/tokens.css**, **styles/globals.css**, and **spec/DESIGN.md** all
   asserted that light is the brand default and that `prefers-color-scheme` is
   consulted. **Both clauses were already false in shipped code** —
   `app/layout.tsx` renders `data-theme="dark"` and the pre-paint script never
   reads `prefers-color-scheme`.

A silent edit would have left the repo's stated law in conflict with its own
code, and would have destroyed a genuinely correct argument in the process.

## Decision

**Adopt Clerk's craft, reject Clerk's identity.** The anti-thesis was *right
about the failure mode* and *wrong about the remedy*. The failure mode — a
portfolio whose visual source a reviewer can name in one glance, undermining the
engineer it is selling — remains a hard constraint. The remedy is not to avoid
studying Clerk; it is to study Clerk's **craft principles** and re-derive them on
original geometry and an original palette.

The new thesis is **"warm light on cold hardware."** Near-black blue-slate
surfaces lit from a single warm source. Warmth is rationed to the things that are
true and checkable — the primary action, the focus ring, the measured value —
while structure, chrome, and prose stay cold and near-monochrome. Most
AI-engineering sites are cold-on-cold (violet or cyan on graphite) and read as
generic infrastructure marketing; ember-on-slate reads as a machine under load,
and cannot be traced to Clerk, Linear, Vercel, or OpenAI.

### Adopted from Clerk (principles, re-implemented)

- Surfaces defined by **sub-pixel rings and inset light** rather than flat borders.
- **One container geometry** repeated verbatim on every band.
- **Small controls against large whitespace** — restraint as the signal of quality.
- Reveals that **resolve into focus** rather than slide in from a distance.
- **One accent, rationed** to a countable number of appearances.

### Explicitly NOT reproduced (Clerk's identifying signatures)

- Their violet (`#6C47FF`) and the indigo/violet family generally.
- The **concave chamfered notch** used as their band-join device.
- **Suisse Intl** and **Söhne Mono**.
- Their nav mega-menu structure and pricing-table composition.

### Motion policy — amended, with written caps

The blanket bans in spec/DESIGN.md §9 are replaced by *capped permissions*. The
following become permitted:

| Effect | Cap |
|---|---|
| Parallax | ≤24px total travel, hero background layer only |
| Ambient background motion | one composited rotation, `transform`/`opacity` only |
| Pane glow on interaction | driven by an `@property` scalar, never by cursor position |
| Magnetic CTA | ≤6px displacement, pointer-fine only, primary action only |
| Scroll reveal / stagger | fires once, ≤8px rise, never on body prose |

The following **remain banned**, and this ADR upholds them:

- Cursor followers and spotlight-follows-mouse.
- Marquees and logo carousels.
- Typing/typewriter effects.
- Tilt cards.
- Scroll-jacking.

Every permitted effect must be compositor-only (`transform`/`opacity`), must have
a **designed still pose** under `prefers-reduced-motion` (not merely a disabled
animation), and must survive the reduced-motion assertion in `scripts/a11y.mjs`,
which requires every computed animation and transition duration to be ≤80ms.

### Dark-first — the law is corrected to match the code

`data-theme="dark"` is the brand default. Light is an explicit, remembered
preference. `prefers-color-scheme` is deliberately **not** consulted. The four
files asserting otherwise were describing behaviour that does not exist and are
corrected as part of this change.

### Layout-property transition — the one recorded exception

The disclosure/accordion pattern transitions `grid-template-rows` (0fr→1fr).
This violates the "never a layout property" rule in design-system.md §6 and
spec/DESIGN.md §1.6. It is retained deliberately: animating to an unknown auto
height otherwise requires JS measurement, and only one short panel is ever in
flight. The perceived motion is carried by compositor-driven `opacity` and
`translate` on the panel contents. **Recorded here so it reads as a decision
rather than a violation.**

## Alternatives considered

- **Keep the signal teal and re-skin around it.** Least churn, and the palette is
  already AA-verified across light, dark, and band contexts. Rejected by the
  owner: it is the accent of the identity the redesign was commissioned to
  replace.
- **Adopt indigo/violet.** The expected premium dev-tool palette, instantly
  legible as high-craft. Rejected: it is Clerk's and Linear's family, and lands
  exactly on the failure the original anti-thesis was written to prevent.
- **Delete design-system.md and spec/DESIGN.md and rewrite from zero.** Rejected:
  their token discipline, measured-contrast rigor, and content law (no metric
  without a linked method) are load-bearing and correct. They are amended in
  place, with this ADR as the record.
- **License a distinctive display face.** Rejected for now: adds a font pipeline,
  licensing step, and FOUT/LCP risk on the exact element the Lighthouse gate
  measures. The originality budget is spent on the palette and the pane geometry
  instead. Geist / Geist Mono / Newsreader are retained.

## Consequences

- design-system.md §1 (thesis), §2 (colour), §5 (section device), and §6 (motion)
  are rewritten. The "graticule seam" device is retired — it shipped broken
  (`.tone-notch.tone-notch-b::after` never matched, so the one band using it drew
  neither edge) and `tone="invert"` had zero call sites — and is replaced by the
  **horizon rule**.
- Every contrast pair is re-derived and re-measured against the new ramp. The
  light theme gets a **hand-authored deep ember** (`#9A4A0B`), not the dark
  theme's amber, because amber cannot clear AA on a light canvas.
- The Lighthouse performance and LCP budgets are re-baselined to honest measured
  floors, and the first-load-JS byte budget — previously documented as enforced
  but implemented as print-only — becomes a real failing gate. See the QA report
  for measured values.
- Sections requiring testimonials, certifications, or upstream open-source
  contributions are **not built**. No backing data exists for any of the three,
  and fabricating them would violate the content law this ADR preserves.
