# CLAUDE.md — mubin-attar.vercel.app → Flagship Upgrade

## What this file is

A phased work plan to take the portfolio from "very good content, uneven execution" to a
flagship-grade personal brand site. The visual/motion north star is **clerk.com** — but adapted
to a personal brand, not cloned. Clerk sells a product; this site sells an engineer. The thing
being demoed is Mubin's judgment, so every Clerk pattern must be translated, not copied:

| Clerk pattern                        | Personal-brand translation                              |
|--------------------------------------|---------------------------------------------------------|
| Live `<SignIn/>` component demos     | Live DBWhisper terminal / architecture graph            |
| "Start building for free" CTA        | "Email me" / "Read the flagship case study" CTA         |
| Customer logos + CEO quotes          | GitHub stars, employer (Sevina), quotes, usage numbers  |
| Feature bento grid                   | "Safety and honesty, engineered in" guarantees grid     |
| Docs/SDK links                       | Case studies + writing                                  |

**Work one phase per session. Do not skip Phase 0. After every phase: screenshot desktop
(1440px) and mobile (390px), compare against the acceptance criteria, fix, then stop.**

---

## Why Clerk feels premium (the actual mechanics)

Copying Clerk's hover effects without its restraint is why "inspired by Clerk" sites fail.
Clerk's premium feel is ~80% discipline, ~20% effects. The discipline:

1. **Borders, not shadows, define surfaces.** 1px borders at very low contrast
   (`rgba(255,255,255,0.06–0.10)` on dark, `rgba(0,0,0,0.06–0.08)` on light). Shadows are
   rare, soft, and large-radius. If a card is visible from across the room, the border is
   too strong.
2. **One accent gradient, used like a scalpel.** Clerk's purple→blue→cyan appears in: the
   hero circuit art, tiny icon accents, an occasional glow behind a bento card, and gradient
   text on maybe one word. It is never a button background, never a section background.
3. **Huge vertical rhythm.** ~120–160px between sections on desktop. Sections breathe.
   Inside sections, everything sits on an 8px grid.
4. **Type does the branding.** Tight-tracked (-0.02 to -0.04em) semibold headlines, a
   restrained scale (~5 sizes total on the homepage), muted secondary text
   (~60–70% opacity), and small uppercase "kicker" labels above each section headline.
5. **Motion is felt, not seen.** 150–250ms, ease-out, `transform`/`opacity` only. Hover =
   border brightens + content lifts 1–2px + icon/arrow nudges. Scroll reveals are a single
   12–16px fade-up with 40–60ms stagger, fire once. Ambient motion (marquee, typing demo)
   is slow and stoppable.
6. **Every section earns its place once.** No two consecutive sections make the same point.
   The homepage is skimmable in 60 seconds; depth lives on subpages.

Encode these as the review lens for every phase.

---

## Verified issues (found in a content/structure review of the live homepage)

These were confirmed against the deployed site on 2026-07-07. Fix them in the phases below.

- **V1 — Back-to-back DBWhisper sections.** "The flagship, up close / How DBWhisper stays
  safe" (3-stage walkthrough + terminal replay) is immediately followed by "The flagship,
  taken apart / Inside DBWhisper" (architecture graph). Two consecutive sections, same
  subject, same CTA ("Read the full case study"), overlapping message. Clerk never does
  this. Merge into ONE flagship section (graph as hero, 3 stages as compact rail beside/below
  it) or make the second section serve a different job entirely.
- **V2 — Homepage carries case-study-depth text.** The architecture graph's per-node
  "Why / Instead of / Tradeoff" essays (9 nodes × ~80 words) are all present on the
  homepage. Even if revealed on click, that content belongs on `/work/dbwhisper`. Homepage
  node reveals should be 1–2 lines + "read the decision →" deep link.
- **V3 — Zero third-party validation.** Clerk's page is saturated with external proof
  (logos, Rauch/Collison quotes, tweets). This site has none: no GitHub stars, no
  colleague/manager quotes, no employer mention. Sevina Technologies is on the GitHub bio
  but absent from the site. For hiring, this is the single biggest credibility gap.
- **V4 — Hire CTA appears only at the very bottom.** Clerk repeats one primary CTA
  relentlessly. Here the conversion action (email / open-to-roles) first appears as a small
  hero caption and doesn't return until the footer. The hero should carry a real
  contact/availability CTA alongside "Read the flagship case study," and it should recur
  mid-page.
- **V5 — Voice repetition.** "Screenshots" as a foil appears 3+ times ("I don't ship
  screenshots", "Live, not screenshots", FAQ "I don't ship screenshots"). "Evidence over
  claims/demos" similarly recurs. Each phrase should land exactly once; vary the others.
- **V6 — Tech marquee redundancy.** The scrolling stack rows are followed by a plain-text
  restatement of the identical list ("Tech stack: FastAPI, Next.js, …"). If that line is an
  SEO/no-JS fallback, mark it `sr-only`/noscript; it currently renders as visible duplication.
- **V7 — Stat card reading "none".** The metric trio renders as `none / 6 / 3`. "none —
  write access to your data" is clever in context but as a scannable stat card it reads as a
  broken value. Restyle so the guarantee reads instantly (e.g., `0` with label "writes ever
  issued to your data", or a ✓-style guarantee chip instead of a numeral).
- **V8 — "Ask Friday /" is unexplained.** A nav item implying an AI assistant + keyboard
  shortcut with no affordance for what it is. Either make it a proper command-palette
  trigger with a tooltip/first-run hint, or cut it. A half-explained AI widget reads as
  gimmick — the exact thing this site's copy argues against.
- **V9 — Off-site inconsistency.** The GitHub profile links `mubinattar.netlify.app` (old
  site) and the TradePulse demo URL differs between the site (`tradepulse-live.vercel.app`)
  and the GitHub README (`ai-powered-trading-system.vercel.app`). Unify every off-site
  surface to the canonical domain — recruiters follow those links.
- **V10 — Footer nav ≠ header nav.** Header: Work/Writing/About/Résumé. Footer adds
  Timeline/Uses. Fine, but confirm intentional; flagship sites make the header the complete
  primary map.

---

## Design tokens (define once in Phase 1, then never hardcode again)

Adapt the palette to the existing brand — do NOT import Clerk's purple. Choose ONE accent
family that fits "grounded, deterministic, engineering-honest" (e.g., a restrained
teal/cyan or amber used for terminal/validator moments) and derive a two-stop gradient
from it. Whatever exists in the current codebase wins if it's already coherent; consolidate
rather than replace.

```css
:root {
  /* surfaces */
  --bg: /* near-black or near-white base, from existing brand */;
  --surface-1: /* card bg, +3–4% lightness from --bg */;
  --border-subtle: /* 6–8% fg opacity */;
  --border-hover:  /* 14–18% fg opacity */;

  /* text */
  --fg: /* primary */;
  --fg-muted: /* 65% */;
  --fg-faint: /* 45%, kickers/captions */;

  /* accent */
  --accent: ...;
  --accent-gradient: linear-gradient(...deg, ..., ...);

  /* motion */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --dur-fast: 150ms;   /* hover color/border */
  --dur-base: 200ms;   /* lifts, reveals */
  --dur-slow: 400ms;   /* section entrances */

  /* rhythm */
  --section-gap: clamp(80px, 12vw, 152px);
  --radius-card: 12px; /* pick one card radius and one control radius, sitewide */
}
```

Type scale (max 5 homepage sizes): kicker (12–13px, uppercase, +0.08em tracking,
--fg-faint) · body (16–17px) · card title (20px) · section headline (32–40px,
-0.02em) · hero (clamp 44–64px, -0.03em). Secondary text always --fg-muted, never
full-contrast gray-on-gray soup.

---

## PHASE 0 — Audit (no code changes)

1. Run the site locally. Screenshot every homepage section at 1440px and 390px.
2. Grep the codebase and produce a report: every hardcoded color, every
   `transition`/`animation` (property, duration, easing), every shadow, every border style,
   every font-size in use, every spacing value between sections.
3. Diff the report against the token spec above. Output: `audit.md` listing (a) token
   violations, (b) motion rules violated (layout-shifting animations, >300ms hovers,
   missing `prefers-reduced-motion`), (c) which of V1–V10 exist in code and where.
4. Lighthouse (mobile): record LCP, CLS, TBT, a11y score as the baseline.

**Done when:** `audit.md` exists with file:line references. Nothing else changed.

## PHASE 1 — Foundation: tokens, type, rhythm, borders

1. Create the token system; migrate every color/duration/radius/spacing to tokens.
2. Enforce the type scale; kill stray sizes. Add kickers consistently — every section gets
   `KICKER → headline → one-sentence lede`, same component, sitewide.
3. Normalize section spacing to `--section-gap`. Normalize card anatomy: one card component
   (border `--border-subtle`, bg `--surface-1`, radius `--radius-card`, consistent padding)
   used by bento cards, product cards, notebook cards, FAQ items.
4. Fix V6 (marquee duplicate text → sr-only) and V10 (nav parity).

**Done when:** zero hardcoded colors/durations outside tokens; screenshots show identical
card anatomy across all sections; vertical rhythm is visibly even.

## PHASE 2 — Structure & narrative (the Clerk skeleton, personal-brand version)

Target homepage order — each section makes exactly one point:

1. **Hero** — headline + lede + dual CTA (primary: flagship case study; secondary:
   availability/email, fixes V4) + the live DBWhisper terminal as the hero artifact
   (Clerk's "component demo in the hero" move — this is the site's signature; invest here).
2. **Proof strip** (fixes V3) — replaces "trusted by" logos: Sevina Technologies, GitHub
   stars/live-product count pulled at build time, years shipping. Real numbers only —
   the site's whole thesis is honest metrics, so a padded proof strip would be
   self-refuting. If a number is small, frame it, don't fake it.
3. **Tech marquee** — keep, tightened (mask-fade edges, pause on hover).
4. **Flagship: Inside DBWhisper** — MERGED single section (fixes V1): interactive
   architecture graph + compact 3-stage safety rail. Node click = 1–2 line reveal + deep
   link (fixes V2). One CTA.
5. **Bento: guarantees grid** ("Safety and honesty, engineered in") — 6 cards, glow accent
   on at most one.
6. **From the notebook** — 3 decision cards (this section is genuinely distinctive; keep).
7. **Products** — 4 live cards, Launch + Case study.
8. **Human proof** (fixes V3) — 2–3 short quotes (colleagues, Sevina, users) if obtainable;
   otherwise a compact track-record row. Placeholder-quote nothing.
9. **Currently exploring + Selected writing** — merge into one two-column section to
   shorten the page.
10. **FAQ** (trim to 4; dedupe V5 phrasing) → **Contact CTA** → footer.

Also in this phase: resolve V5 (one "screenshots" occurrence sitewide), V7 (stat card),
V8 (Ask Friday: proper affordance or removal), V9 (update GitHub bio + README URLs —
produce the corrected README text for manual paste if repo access is out of scope).

**Done when:** homepage scans in ~60s; no two adjacent sections repeat a subject; primary
CTA appears ≥3 times; every V-item closed or explicitly deferred with a reason.

## PHASE 3 — Motion system (the Clerk feel)

Global rules (enforce with a lint pass at the end):
- Animate `transform` and `opacity` only. Zero layout shift from any animation.
- Hover: `--dur-fast`, border → `--border-hover`, translateY(-1px to -2px) max, arrow/icon
  nudge 2–3px. No scale >1.02, no glow explosions.
- Scroll reveals: IntersectionObserver, fire once, 12–16px fade-up, `--dur-slow`,
  40–60ms stagger within a group. Never re-trigger on scroll-up.
- `prefers-reduced-motion: reduce` → all ambient/entrance motion off, hovers reduced to
  color/border only.

Signature effects (the Clerk moves worth doing well — pick these, cut everything else):
1. **Hero terminal typing loop** — query types → stages check in → SQL paints → result
   count. Slow, ~8–10s loop, pauses on hover, replays on click. This is the site's one
   "wow"; polish it to production quality.
2. **Gradient-border hover on flagship/bento cards** — 1px gradient border that fades in
   on hover (Clerk's card treatment). One implementation, reused.
3. **Architecture graph hover** — hovered node brightens, connected edges draw/brighten
   (~200ms), non-connected dim to 40%. Keyboard focus behaves identically.
4. **Marquee** — CSS-only, linear, ~30–40s loop, edge mask, `animation-play-state: paused`
   on hover.
5. **Nav** — backdrop-blur bar that gains a bottom `--border-subtle` after 8px scroll.

**Done when:** motion lint passes; reduced-motion verified; every hover ≤250ms; hero loop
runs without jank at 4× CPU throttle in devtools.

## PHASE 4 — Section-by-section polish

Go section by section against the Phase 2 order. For each: screenshot → critique against
the "why Clerk feels premium" list → fix → re-screenshot. Specific mandates:
- Hero headline max 2 lines at 1440px; lede max 2 lines; CTAs on one row.
- Bento cards: title + 2 lines max; overflow goes to case studies.
- Product cards: consistent metadata order (status chip · one-line tech tag · title ·
  2-line description · Launch/Case study), cold-start note as a single muted line.
- FAQ: native `<details>` or accessible accordion, chevron rotates `--dur-fast`.
- Footer: tighten to brand line + nav + socials + colophon; the "Thanks for reading this
  far" note is good voice — keep it, style it as the footer's one warm moment.

**Done when:** side-by-side screenshots per section pass the discipline checklist (border
weight, spacing, type scale, single accent).

## PHASE 5 — Subpages to the same standard

Apply tokens + motion + kicker pattern to `/work`, `/work/dbwhisper` (absorbs the V2
content as proper long-form with sticky TOC), `/writing`, `/about`, `/resume`, `/timeline`,
`/uses`. The flagship case study is the page recruiters will actually read — give it
Phase-4-level polish, including the full Why/Instead-of/Tradeoff node content moved from
the homepage.

## PHASE 6 — Quality floor & ship

- Lighthouse mobile ≥ 95 perf / 100 a11y; CLS < 0.02; LCP < 2.0s.
- Full keyboard pass: every interactive element focusable, visible focus ring
  (2px accent outline, 2px offset), graph nodes included.
- OG images per page; metadata/copy consistency pass (one canonical availability line,
  one email, canonical URLs everywhere — closes V9 remnants).
- Cross-check GitHub profile, README, LinkedIn all point to mubin-attar.vercel.app (or the
  final custom domain — buying `mubinattar.com` is recommended for flagship positioning).

---

## Working rules for Claude Code

1. One phase per session. Re-read this file and `audit.md` at session start.
2. Never introduce a new color, duration, or radius outside the token file.
3. Every change is verified by screenshot before it counts as done.
4. When in doubt between "more effect" and "less effect," choose less — the Chanel rule:
   before shipping a section, remove one accessory.
5. Do not invent metrics, quotes, or logos. If proof doesn't exist yet, leave the slot
   out — this site's brand is honesty; a fake testimonial would cost more than the gap.
6. Keep a running `notes.md` of decisions + rejected options (matches the site's own
   "decisions I rejected" ethos, and helps future sessions).
