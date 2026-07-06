# SPRINT 1 — Foundation

> **Paste to Claude Code:**
> Read CLAUDE.md fully. Then read spec/ENGINEERING.md, spec/DESIGN.md §1–2, and
> spec/ARCHITECTURE.md. Implement this sprint task by task, in order. After each task run
> the listed verification and fix failures before continuing. Finish with the DoD checklist.

**Goal:** a deployed, CI-guarded, tokenized app shell. No product features yet.
**Exit demo:** live Vercel URL showing header/nav/footer + empty home, Lighthouse ≥ 95.

## Tasks

### T1 — Initialize
pnpm + Next.js 15 (App Router, `src/`), TypeScript strict per ENGINEERING §1, Tailwind v4.
Scripts: dev/build/typecheck/lint/test/test:e2e/verify/content (stubs fine for content).
**AC:** `pnpm verify` passes on the empty app; tsconfig matches ENGINEERING §1 exactly.

### T2 — Design tokens
`src/styles/tokens.css` with EVERY token from DESIGN §1 (light + dark via
`[data-theme="dark"]`), wired through Tailwind `@theme`. Fonts via `next/font`
(Geist Sans, Geist Mono, Newsreader) self-hosted, subset, swap.
**AC:** a demo element styled purely by tokens flips correctly between themes; total font
payload ≤ 130 KB (check build output); zero raw hex outside tokens.css.

### T3 — Quality tooling
ESLint 9 flat config (typescript-eslint strict, react, jsx-a11y, import order),
Prettier, Vitest + RTL setup with one example lib test, Playwright + @axe-core/playwright
with one a11y test against `/`.
**AC:** all run headless via pnpm scripts; lint catches an intentional `any`.

### T4 — CI
`.github/workflows/ci.yml`: install (pnpm cache) → typecheck → lint → test → build on PR
and main; Playwright job on main-targeting PRs.
**AC:** pipeline green on a test PR; red on an introduced type error (then revert).

### T5 — App shell
Container, Section, Header (logo=name in mono xs, nav: Work/Writing/About + "Ask about
my work" ghost placeholder + ThemeToggle), MobileNav (drawer, focus trap, Esc closes),
Footer (one-line colophon: name · source link placeholder · llms.txt placeholder),
skip-to-content link, `not-found.tsx`.
**AC:** full keyboard operability; visible focus everywhere; active nav state (accent —
counts toward accent budget); axe clean; layout holds at 360/768/1120.

### T6 — /dev/components scaffold
Route with theme toggle + empty sections per upcoming primitive list (BACKLOG E2). noindex.
**AC:** reachable in dev; blocked in robots (stub robots.ts now).

### T7 — Deploy + analytics
Vercel project, production + preview; privacy-first analytics wired (no cookie banner
needed); `src/config/env.ts` with Zod (SITE_URL only for now).
**AC:** live URL; analytics registering pageviews; build-time env validation crashes on
missing var (test once).

## Verification (after every task)
`pnpm verify` · manual keyboard pass on changed UI · `pnpm test:e2e` after T5+.

## Definition of Done
[ ] All ACs met  [ ] CI green on main  [ ] Deployed  [ ] Lighthouse ≥ 95/100/100/100 on `/`
[ ] Zero console errors  [ ] No hardcoded copy/values  [ ] CLAUDE.md commands all work
