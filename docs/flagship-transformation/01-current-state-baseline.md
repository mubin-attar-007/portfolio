# 01-current-state-baseline

Date updated: 2026-08-14

## Repository Architecture Baseline (Evidence-first)

| Fact | Repository evidence | Verification status | Remaining uncertainty |
| --- | --- | --- | --- |
| Next.js framework version | `package.json` -> `dependencies.next: "^16.2.11"` | Confirmed | Exact installed patch version from lockfile entry (not manually extracted) |
| React runtime version | `package.json` -> `dependencies.react: "19.2.4"` and `dependencies["react-dom"] "19.2.4"` | Confirmed | None |
| Package manager | `package-lock.json` present; no `yarn.lock` or `pnpm-lock.yaml` | Confirmed | Whether contributors ever used pnpm/yarn in another branch |
| Lockfile | `package-lock.json` exists; `pnpm-lock.yaml` and `yarn.lock` absent | Confirmed | None |
| App Router status | `app/` directory contains all route entry points (e.g., `app/page.tsx`, `app/about/page.tsx`, etc.) and `app/layout.tsx` | Confirmed | None |
| TypeScript configuration | `tsconfig.json` with `plugins: [{ name: "next" }]`, `strict: true`, `noEmit: true`, `moduleResolution: "bundler"` and path alias `"@/*"` | Confirmed | None |
| Build mode | `next.config.ts` exports `output: "standalone"` and standard `next build`/`next start` scripts | Confirmed | None |
| Styling system | `styles/globals.css` plus `postcss.config.mjs` using `@tailwindcss/postcss` | Confirmed | Full runtime utility scope not re-audited in this packet |
| Content model | `content/` holds `mdx` plus `json` and `ts` data (projects, notes, writing, resume, evals, skills, site metadata) | Confirmed | Whether editorial content quality is complete (P0-R2 scope) |
| Test framework | `package.json` script `test` is `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --import ./test/alias-loader.mjs --test "test/**/*.test.mts"` | Confirmed | Full runtime behavior of every test case not rerun until requested |
| Accessibility tooling | `scripts/a11y.mjs` runs Playwright + axe-core against local server; test script `npm run test:a11y` exists | Confirmed | These checks are not part of required P0-R1 pass set |
| Lighthouse tooling | `scripts/lighthouse-budget.mjs` used by `npm run test:lighthouse` and `npm run test:metadata` | Confirmed | Budgets are not re-tuned in this packet |
| Deployment configuration | `next.config.ts` (headers, redirects, standalone output); no `vercel.json` file in repo | Confirmed | Vercel project-level settings outside repo not verified from source |
| Environment-variable schema | `lib/env.ts` defines `NEXT_PUBLIC_SITE_URL` and `ASSISTANT_DAILY_CAP`; ad-hoc env reads also occur in route/page code (`GEMINI_API_KEY`, `NEXT_PUBLIC_CAL_URL`, etc.) | Confirmed | No centralized schema for every env variable |
| Server/client boundaries | `app/layout.tsx` server component; route files without `"use client"` are server-rendered; client logic is isolated in component files imported by routes (e.g., `components/*`) | Confirmed | Full boundary map across all components remains in prior packets |
| API routes | `app/api/chat/route.ts` is the only explicit API route in source | Confirmed | Any external ingress edge config is outside repository |
| Route generation | Static pages exist in `app/*/page.tsx`; dynamic routes with static generation exist for slugs via `generateStaticParams` in `app/notes/[slug]/page.tsx`, `app/work/[slug]/page.tsx`, `app/writing/[slug]/page.tsx` | Confirmed | No additional dynamic route generator outside `app/` |
| Middleware/proxy | No `middleware.ts`, `middleware.js`, `proxy.ts`, or `proxy.js` file in repository root | Confirmed | None |
| Metadata, robots, sitemap, feed generation | `app/robots.ts`, `app/sitemap.ts`, `app/rss.xml/route.ts`, `app/writing/feed.xml/route.ts`; Open Graph image sources in `app/*/opengraph-image.tsx` and `app/opengraph-image.tsx` | Confirmed | Route exposure of OG image outputs is verified as documented by implementation files only |
| Source vs live-route contradiction | Source has **3** static-dynamic families (`notes`, `work`, `writing`), not 2 | Confirmed | Why one source route still appears live (`/timeline`, `/talks`, `/changelog`) is under Packet D investigation |

## Current contradictions resolved

- The previous baseline text claiming "two dynamic SSG sections" is corrected to "three dynamic SSG families: `notes`, `work`, and `writing`."
- There is a current source-page route for `/hire`, while `/contact` and `/home` do not exist in source.
- Canonical API endpoint is `/api/chat` and is explicitly implemented; `/api/ask` has no route file in current source.
- Legacy/legacy-looking routes (`/timeline`, `/talks`, `/changelog`) are absent as source files and are therefore flagged for Packet D investigation.
