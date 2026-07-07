# Flagship-v2 — running notes (decisions + rejected options)

Branch: `flagship-v2` (off `main` @ 852f208). Never touches main; never deploys to prod.

## Decisions

### D0 · Accent color: KEEP Clerk purple `#6c47ff` (rejected the plan's teal/amber suggestion)
The plan (§Design tokens) suggests *not* importing Clerk's purple and choosing a teal/amber
family. **Rejected**, for two reasons that both point the same way:
1. The owner **explicitly** directed "use Clerk's exact color across all components" and it
   shipped to production as v2.0.2 days ago. Owner's explicit words outrank a plan suggestion.
2. The plan's own token rule says *"Whatever exists in the current codebase wins if it's already
   coherent; consolidate rather than replace."* The purple system is coherent and complete
   (light/dark/tone-invert, AA-verified). So the plan's own clause keeps it.
   → Action: keep `--color-accent: #6c47ff` (light) / `#9a7fff` (dark). Consolidate, don't recolor.

### D1 · Token naming: keep existing `--color-*` / `--motion-*` / `--radius-*` names
The plan sketches `--bg`, `--surface-1`, `--dur-fast`, etc. The codebase already has a complete,
coherent token layer in `styles/tokens.css` (`--color-bg`, `--color-surface`, `--color-border`,
`--color-accent`, `--motion-fast/base/slow`, `--ease-out`, `--radius-*`, `--space-section-*`).
Per "consolidate rather than replace," I map the plan's intent onto the existing names rather
than renaming sitewide (which would be churn with no user-visible benefit).

### D2 · Dev/verify loop
Verify against a **production build** (`next build` + `next start -p 3200`) — representative of
what ships, and it surfaces hydration errors in the console (captured via Playwright). Screenshot
at 1440 and 390 each phase.

## Deferred / rejected
(running list — appended per phase)

### D3 · V10 (header vs footer nav) — INTENTIONAL, documented (not a bug)
Header = the **primary destinations** (Work/Writing/About/Résumé) in the signature pill nav;
footer = the **full site map** (adds Timeline + Uses, the secondary/supporting pages). This is a
deliberate, common flagship IA: a lean premium header + a complete footer. Adding Timeline+Uses
to the pill would crowd the signature nav (already 4 links + the Friday launcher + theme toggle).
→ V10 resolved as "intentional." (If the owner wants everything in the header, it's a one-line
add to `config/nav.ts`.)

### D4 · V6 (marquee duplicate text) — already resolved in v2.0.2
`skill-rotator.tsx` renders the plain-text stack list as `<p className="sr-only">…</p>` (Tailwind
visually-hidden) — it's a screen-reader/SEO fallback, not visible. The plan's audit flagged it
against an earlier build (the old `ticker.tsx`, since deleted). → V6 closed (verified hidden).

### D5 · Kicker/card unification → folded into Phase 2
Card anatomy is already consistent sitewide (`border-border` + `bg-surface` + `--radius-lg` +
`--shadow-sm`, same padding). Two kicker patterns coexist: `<SectionHeading>` (kicker in
`--fg-faint`) and newer inline kickers in `--accent`. Rather than churn them now, I unify to ONE
kicker treatment while rebuilding sections in Phase 2 (the sections get rewritten there anyway).
Decision on kicker color deferred to Phase 2 (leaning accent — on-brand, Clerk-like, owner loves
the purple; the plan's "faint kicker" is a guideline, not a hard rule).

## Phase log
- **Phase 0** ✅ — audit.md (baseline Perf 79 / A11y 100 / LCP 5.6s / CLS 0 / TBT 40ms), no code changed.
- **Phase 1** ✅ — tokenized the 2 stragglers: `--drop-node` (diagram node shadow, was a
  hardcoded rgba) + `--motion-reveal` (600ms) / `--motion-slow` for inline durations in
  system-diagram + capability-grid. V6 closed (sr-only). V10 closed (intentional). Card anatomy
  already consistent; full kicker unification → Phase 2.
- **Phase 2** (in progress) — homepage restructured (`app/page.tsx`):
  - **V1** ✅ merged the two DBWhisper sections into ONE flagship section (architecture graph +
    a compact 3-stage safety rail); deleted the now-dead `component-showcase.tsx`.
  - **V2** ✅ `SystemDiagram` gained a `compact` prop — homepage node reveal is now `description`
    + "Read the decision behind X →" deep link; full Why/Instead-of/Tradeoff essays stay for the
    case study (rendered when `!compact`). Passed `compact` from the homepage.
  - **V3** ✅ added `ProofStrip` (Sevina Technologies employer anchor + 3 real stats: 4 live
    products / 3+ yrs / $0 infra). No stars (only 1 total — too small to show without undercutting
    the honesty thesis) and no quotes (→ TODO_HUMAN).
  - **V4** ✅ hero now has a dual CTA (case study + **Get in touch**); added a **mid-page hire
    CTA** band (availability + Get in touch) so the conversion action recurs (hero → mid → footer
    = 3×).
  - **V5** ✅ "screenshots" now lands once (hero lede). `home.live.kicker` → "Deployed, not
    described"; FAQ "what you don't do" rephrased off "screenshots".
  - **V7** ✅ removed the raw "none / 6 / 3" metric trio from the homepage flagship section (it
    read as a broken stat); the safety story is carried by the 3-stage rail; the metrics remain on
    the case study.
  - **V8** ✅ "Ask Friday" trigger got a native `title` + richer `aria-label` explaining it's an
    AI assistant grounded on the site (press /).
  - **V9** ✅ exact copy-paste corrections written to `TODO_HUMAN.md` (GitHub website field
    netlify→vercel; TradePulse README demo URL → `tradepulse-live.vercel.app`). External, human-only.
  - Also: **removed the Principles section** (its message overlaps the guarantees bento + the
    flagship safety story — Chanel rule, shortens the page); **merged Currently-exploring + Selected
    writing** into one two-column section. Mid-CTA band set to `bg-surface` so it doesn't read as a
    second subtle band next to exploring.
  - **Order deviation from the plan (documented):** kept Field-notes BEFORE the guarantees bento
    (plan lists bento first) to preserve the light/dark **notched** alternation (flagship dark →
    notebook light → bento dark → products light). The plan's exact bento-before-notebook order
    would put two dark bands adjacent. Subject-adjacency (the real V1 concern) is fully satisfied:
    no two neighbouring sections share a subject.
- **Phase 3** (motion system) —
  - **Signature effect #1 built:** the hero terminal is now a **typing loop** — types the query,
    reveals retrieve → validate → SQL → result, holds ~3.2s, loops (~10s total). **Pauses on
    hover, replays on click**, renders the full static frame under prefers-reduced-motion. Driven
    by a self-scheduling effect (no leaked timers). This is "the site's one wow" per the plan.
  - **Hover durations trimmed to ≤250ms** (plan rule): diagram node + capability-card hover
    transitions 300ms→`--motion-base` (200ms). Reveal timings stay `--motion-reveal` (600ms).
  - **#3 graph hover** already met the spec (hovered node brightens + lifts, connected edges
    brighten via `sd-flow`, non-connected edges dim to 0.4; keyboard focus = same path). Left as-is.
  - **#2 gradient-border hover → solid `border-strong` brighten** (documented divergence): the
    owner chose ONE **solid** accent (`#6c47ff`), not a gradient (D0). "Border brightens on hover"
    is implemented with `--color-border-strong`; a gradient border would introduce a gradient we
    deliberately don't have.
  - **#4 marquee → slot-machine** (documented): the continuous marquee was replaced by the
    slot-machine SkillRotator in v2.0.x (owner-approved). It's slow + discrete + edge-masked, so it
    meets the "ambient motion is slow and not distracting" intent; kept.
  - **#5 nav scroll-border → floating pill** (documented): the nav is a floating bordered pill
    (always bordered), not a full-width bar that gains a border on scroll — different, intentional
    design. Kept.
  - **Reduced-motion:** global rule collapses all transition/animation durations to ~0 (8 blocks),
    so no animated motion runs; the hero terminal + capability reveals + illustrations all have
    explicit reduced-motion static paths. Instant sub-2px hover offsets are imperceptible (meets
    "hover = colour/border only" intent).
