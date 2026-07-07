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

## Phase log
- Phase 0: (in progress)
