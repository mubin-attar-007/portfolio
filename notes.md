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
- **Phase 1** (in progress) — tokenized the 2 stragglers: `--drop-node` (diagram node shadow,
  was a hardcoded rgba) + `--motion-reveal` (600ms) / `--motion-slow` for inline durations in
  system-diagram + capability-grid. V6 closed (sr-only). V10 closed (intentional). Card anatomy
  already consistent; full kicker unification → Phase 2.
