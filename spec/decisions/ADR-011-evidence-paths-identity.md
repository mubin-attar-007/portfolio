# ADR-011 — "Evidence paths": a light-first, single-accent flagship identity

Status: **Accepted**. Supersedes [ADR-010](./ADR-010-ember-console-identity.md).
Amends `spec/DESIGN.md` §1, §4, §5, §9 and `design-system.md` §1–§6.

## Context

The owner commissioned a full redesign of the personal brand site with
**clerk.com named as the visual-quality benchmark** — hierarchy, whitespace,
surface design, typography, restrained motion, light/dark section contrast — and
a specific target identity: **light-first**, a **violet accent**, Geist Sans and
Geist Mono, an original "evidence graph" motif, and a homepage reduced to one
narrative of roughly seven sections.

Three things in the repository contradicted that brief:

1. **ADR-010 had explicitly rejected violet**, on the grounds that it is Clerk's
   and Linear's family and lands on the failure mode the original anti-thesis was
   written to prevent (a portfolio whose visual source a reviewer can name).
2. **ADR-010 had made dark the brand default.** `app/layout.tsx` rendered
   `data-theme="dark"`.
3. **The shipped accent was neither ADR-010's ember nor violet — it was teal**
   (`#0f6e6a`). ADR-010's identity was written down but never implemented, so the
   repository's stated law, its ADR, and its code all disagreed.

Separately, an audit of the working tree found the homepage and the other fifteen
routes had become two different products: `/` was a bespoke 921-line CSS-module
system with its own container, type ramp, spacing scale and card vocabulary,
while every other route used `Section` + `PageHeader` + Tailwind utilities. The
cliff at the first click was the single largest quality defect on the site.

## Decision

**Adopt the brief.** Light is the brand, violet is the accent, and the homepage
and the interior routes are rebuilt on ONE system.

ADR-010's *reasoning* about the failure mode was correct and is preserved: a
portfolio whose visual source is nameable in one glance undermines the engineer
it is selling. Its *remedy* — avoid the expected palette — is rejected, because
the owner has since made the trade explicitly and because originality is cheaper
to buy in geometry and content than in hue. Concretely:

- **The palette is conventional; the artwork is not.** The `EvidenceGraph` motif
  (`components/home/evidence-graph.tsx`) draws this site's actual argument — a
  request routed through retrieve → validate → execute → measure, with one branch
  that ends in a refusal rather than a result. No competitor's background is a
  diagram of a fail-closed validator.
- **The proof surfaces are not borrowed.** The "trusted by" wall is replaced by a
  stack wall (there are no customer logos, and inventing some would break the
  content law); the metric band links every number to the page where it can be
  checked; the hero product surface is a real DBWhisper run using the agent's
  actual tool names.
- **Nothing of Clerk's is reused** — no logo, name, copy, illustration,
  screenshot, or product UI.

### The accent is measured, not quoted

The brief named `#6857F5`. The shipped token is **`#6552F0`**, because the accent
must clear WCAG AA **as text** on all three light grounds and `#6857F5` measures
4.36:1 on `--color-bg-subtle` — under 4.5:1. `#6552F0` measures 5.2:1 on surface,
4.9:1 on the page, 4.6:1 on the subtle band, and carries white at 5.2:1 as a fill.
Accessibility is a hard constraint in CLAUDE.md; a 1.5% hue shift is not.

The dark ramp lifts the same hue to **`#A99CFF`** (7.7:1 on the dark band),
because `#6552F0` measures 3.5:1 there. `--color-positive` was likewise darkened
from `#15803d` to `#146b33`: the original measured 4.45:1 on `--color-bg-subtle`,
which the accessibility gate caught on the 12px syntax tokens in the hero stage.

### Light-first, and the law now matches the code

`data-theme="light"` is the server-rendered default and the pre-paint script
falls back to light. Dark is an **explicit, remembered preference**;
`prefers-color-scheme` is still deliberately not consulted, because the light page
with its two dark bands *is* the identity rather than a mode the OS may pick.
Both explicit values keep working, which `scripts/a11y.mjs` asserts.

### One system, not two

- The homepage is rebuilt on `Section` / `Container` / the shared type tokens.
  The bespoke homepage container, spacing scale and h1 clamp are deleted.
- `--text-display` / `--text-section` / `--text-sub` are wired. `PageHeader` and
  the homepage hero previously hand-rolled two different definitions of "the
  biggest type on a page"; there is now one display step for the hero and one
  section step for every other heading, and the gap between them is a decision in
  `tokens.css` rather than two clamps that happen to differ.
- `ProjectCard` (`components/work/project-card.tsx`) is the site's ONE project
  tile, used by both the homepage bento and `/work`. Its content — including the
  card definition, category and screenshot — lives on the project in
  `content/projects.ts`, so the two surfaces cannot describe a product
  differently.

### The graticule seam is retired

The device drew a tick-scale at every light↔dark boundary. It read as instrument
chrome and competed with the content it framed; it had also shipped partly broken
(`.tone-notch-b::after` never matched). Dark bands now have a clean full-bleed
edge. `Section`'s `notch` prop is removed.

### Motion policy

Micro 150ms · standard 260/320ms · reveal 500ms, on one curve. Permitted:
opacity/transform reveals, a 4px card lift, a 1.015 product-shot scale, a single
slow travelling dash on the hero motif, and the stack wall's dwelling cycle.

**Still banned:** cursor followers, spotlight-follows-mouse, marquees and logo
carousels, typewriter effects, tilt cards, scroll-jacking, and parallax (the
brief's "very restrained pointer parallax" was NOT implemented — see Consequences).

Every non-essential effect must live inside `@media (prefers-reduced-motion:
no-preference)` and have a **designed still pose**, not merely a disabled
animation. The hero's travelling dash is not rendered at all under reduced
motion, so it cannot freeze mid-route as an unexplained mark; the stack wall's
timer never starts, so it renders as a static row.

### The serif stays, scoped

Newsreader is retained, italic-only and unpreloaded, for exactly one component —
the long-form `PullQuote` inside an article body. It was removed from the footer
sign-off and from the homepage. `design-system.md`'s claim that "serif appears in
exactly one place per page" was false in both directions and is corrected.

### The disclosure exception, still recorded

The accordion transitions `grid-template-rows` (0fr→1fr), violating the
"never a layout property" rule. Animating to an unknown auto height otherwise
requires JS measurement; the perceived motion is carried by compositor-driven
opacity and translate on the contents. Recorded here so it reads as a decision.

## Alternatives considered

- **Keep teal and re-skin around it.** Least churn and already AA-verified.
  Rejected by the owner: it is the accent of the identity the redesign was
  commissioned to replace.
- **Implement ADR-010's ember-on-slate instead.** It is the more *original*
  palette and its argument is good. Rejected: it was never built, the owner has
  since specified light-first violet directly, and a warm dark identity cannot
  deliver the light-first Clerk-caliber presentation the brief asks for.
- **Rename the colour tokens to the brief's vocabulary** (`--color-page`,
  `--color-dark-surface`, …). Rejected: roughly sixty components already read
  `--color-bg` / `--color-ink` / `border-border`, the names were already semantic
  and correct, and renaming them would have been a large diff with no design
  payoff. The redesign changed the VALUES, not the vocabulary.
- **Delete the eval registry's honest framing for a cleaner scoreboard.**
  Rejected outright: it is the site's differentiator.

## Consequences

- The light/dark contrast pairs are re-derived and re-measured. `scripts/a11y.mjs`
  passes with **0 violations** across 18 routes × 2 themes × 3 viewports, plus the
  overlay states, the reduced-motion contract and the keyboard focus-trap
  contract.
- `lib/og.tsx`'s six inlined hexes are migrated to the new palette. Satori cannot
  read CSS variables, so these literals are the one legitimate place in the
  codebase that hardcodes a brand colour, and **nothing tests their colour** —
  the gate only checks that an `image/*` byte-stream comes back. They must be
  updated together with `styles/tokens.css`.
- Four dead components are deleted (`split-feature`, `check-list`, `faq`, the
  abandoned `diagrams/data/index.ts` barrel), along with the two homepage modules
  they were built beside and ~270 lines of orphaned copy in `content/site.ts` —
  several blocks of which still asserted numbers that had been corrected
  elsewhere. Dead copy that states a metric is not harmless: it is a second source
  waiting to be re-rendered and disagree with the first.
- The homepage's 82% / 100% pair is no longer typed by hand. It is read through
  `DBWHISPER_GOLDEN` in `content/evals.ts`, which throws at module load if the row
  is renamed or removed. Eval anchors come from one exported `evalAnchor()` rather
  than a local slugifier on `/evals` and hardcoded strings everywhere else.
- **`SITE.role` changed** from "AI Software Engineer" to "AI Systems Engineer",
  which changes the home `<title>`. That string is asserted byte-for-byte by
  `scripts/lighthouse-budget.mjs`; the gate was updated in the same change. The
  employment titles in `content/resume.ts` and `content/timeline.ts` are facts
  about jobs held and are untouched.
- **The Lighthouse performance budget still fails, as it did before this work.**
  Measured on the same machine, pre-redesign `HEAD` scored 78 / 79 / 79 with LCP
  5.5s / 5.0s / 5.3s; after the redesign, 74 / 82 / 80 with LCP 6.2s / 4.5s /
  5.3s. The flagship route improved, `/writing` is flat, and the homepage is ~4
  points behind on a substantially richer first screen. The cause is a
  pre-existing ~550KB app-router JS payload that saturates the simulated 1.6 Mbps
  link and delays the webfont swap that defines LCP (measured: the LCP element is
  the hero lede paragraph, and it changes at the swap). Accessibility, best
  practices and SEO are 100 on all three routes and CLS is 0.000.
- One regression was introduced and fixed during the work: `TechWall` imported
  the content layer directly, dragging the eval registry and Zod across the client
  boundary and adding ~290KB to the homepage bundle. Client components take props;
  they do not read `content/`.
- **Four unbacked claims were removed rather than restyled.** `content/faq.json`
  asserted "four live AI products, each multi-user" — true of one of them, and
  that file is the assistant's highest-signal corpus, so the widget was repeating
  it to visitors on every route. `content/resume.ts` claimed all four products
  are measured, which LLM Studio is not. A note described the DBWhisper evals as
  still running, which they no longer are. And CrownWager cited a "2.3/10 on a
  twelve-dimension assessment" in four places — a self-conducted, unnamed,
  undated rubric applied to a private codebase. The site's own rule covers that
  last case exactly: if a number cannot be shared, describe the mechanism and say
  so. The rebuild's hardening is checkable in CI; the score is not, so the score
  is gone and the mechanism stays.
- **A print stylesheet was added** (`styles/globals.css`, gated by
  `npm run test:print`). There were none, so printing /resume produced the
  availability bar, the nav, the footer, a "Download PDF" button on the page
  being turned into a PDF, and every card shadow. The brief asks for a printable
  résumé; it was never verified before.
- **`--radius-sm` moved 4px → 6px during the token rewrite**, and 26 call sites
  quietly got rounder. Each has now been assigned deliberately: metadata (tags,
  inline code, `kbd`, status pills) to `--radius-xs`, controls to `--radius-sm`,
  callout-scale blocks and the floating evidence card to `--radius-md`.
- **One focus indicator.** Two components had opted out of the global
  `:focus-visible` ring with their own `ring-*` utilities, giving the site three
  focus looks. What they wanted was breathing room around a large target, which
  is `outline-offset`, not a different indicator. Overlay scrims were likewise
  two untokenised values (`bg-ink/15` and `bg-ink/20`) and are now one `--scrim`.
- **Parallax was specified in the brief and deliberately not built.** The hero's
  moving parts are a single travelling dash and the stack wall's cycle. Pointer
  parallax on a hero whose LCP already misses its budget by 4 seconds would have
  spent frames on the one screen that cannot afford them, and it has no designed
  still pose that is not simply "off".
