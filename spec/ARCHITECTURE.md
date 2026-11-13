# ARCHITECTURE.md — System design

## 1. Stack (decisions recorded in spec/decisions/)

| Layer | Choice | ADR |
|---|---|---|
| Framework | Next.js 16 App Router, React 19 | ADR-001 |
| Language | TypeScript strict | — |
| Styling | Tailwind CSS v4, CSS-first tokens (`styles/tokens.css`) | ADR-002 |
| Content | Typed TS modules + MDX (`next-mdx-remote`) + Zod | ADR-003 |
| Repo shape | Single app (no monorepo) | ADR-004 |
| Diagrams | Custom `SystemDiagram` (SVG + HTML) | ADR-005 |
| Assistant | In-memory BM25 over `content/` → `/api/chat` (Node.js runtime) → Gemini, with a grounded fallback | ADR-006 |
| Component preview | `/dev/components` route (no Storybook) | ADR-007 |
| Code highlighting | Shiki, server-rendered | ADR-008 |
| Testing | `node:test` unit tests · Playwright + axe-core scripts · Lighthouse CLI | ADR-009 |
| Hosting | Vercel (see DEPLOY.md), the only target that runs the whole app. `npm run build:sites` also builds an OpenNext Cloudflare bundle (`open-next.config.ts`, `wrangler.jsonc`) and stages a static copy in `dist/` (`scripts/stage-sites-build.mjs`): prerendered pages behind an asset-only worker, with no `/api/chat` | — |
| Analytics | `@vercel/analytics`, Vercel deployments only | — |

## 2. Repository structure

```
.
├── app/                  # routes, layout, metadata, OG images, feeds, /api/chat
├── components/
│   ├── case-studies/     # one body per project, walkthrough, reading outline
│   ├── diagrams/         # SystemDiagram + data/<slug>.ts
│   ├── features/         # assistant, theme toggle, copy buttons, lists, proof strip, timeline
│   ├── home/             # homepage sections, boundary inspector
│   ├── layout/           # header, footer, navigation, container, section
│   ├── mdx/              # MDX component map, DecisionLog, FailureLog, prose classes
│   ├── seo/              # JSON-LD
│   ├── ui/               # primitives: button, tag, callout, metric, code block, …
│   └── work/             # ProjectCard
├── config/               # site.ts (identity, status, integrations), nav.ts
├── constants/            # shared class constants (page.ts, bands.ts)
├── content/              # typed content modules, Zod schemas, MDX, JSON (CONTENT_MODEL.md)
├── lib/                  # loaders, formatting, feeds, env, analytics, hooks; ai/ (assistant)
├── public/               # résumé PDF, demo recordings + captions, portrait, llms.txt
├── scripts/              # browser gates, Lighthouse, résumé PDF, Sites build staging
├── styles/               # tokens.css, globals.css
├── test/                 # node:test unit tests + alias loader
├── spec/                 # charter, standards, architecture, content model, assistant, ADRs
└── .github/              # workflows/ci.yml, workflows/keep-demos-alive.yml, dependabot.yml
```

## 3. Routes and rendering

| Route | Source |
|---|---|
| `/` | Homepage: hero + boundary inspector, selected work, engineer strip, writing and now, contact band |
| `/work`, `/work/[slug]` | `content/projects.ts`; bodies in `components/case-studies/<slug>.tsx` |
| `/writing`, `/writing/[slug]` | `content/writing/*.mdx` |
| `/notes`, `/notes/[slug]` | `content/notes/*.mdx` |
| `/now` | `content/now.mdx` |
| `/evals` | `content/evals.ts` |
| `/about`, `/hire`, `/uses`, `/trust` | `content/site.ts` (and `content/timeline.ts` on `/about`) |
| `/resume`, `/skills` | `content/resume.ts` |
| `/privacy` | Copy written in `app/privacy/page.tsx` |
| `/dev/components` | Component preview, `noindex` (ADR-007) |
| `/api/chat` | Assistant route handler (AI_ASSISTANT.md) |
| `/rss.xml`, `/writing/feed.xml` | RSS 2.0: writing + notes, and writing only |
| `/sitemap.xml`, `/robots.txt`, `*/opengraph-image` | Metadata routes |

`/talks` and `/timeline` permanently redirect to `/about`, and `/changelog` to `/now`
(`next.config.ts`).

- Everything content is **statically generated** at build: `[slug]` routes use
  `generateStaticParams` with `dynamicParams = false`, and the feeds are
  `force-static`. No runtime CMS, no client fetching for content, no loading spinners
  on content routes. `/api/chat` is the one dynamic route (`force-dynamic`, Node.js
  runtime).
- Server Components by default. MDX bodies render through the component map in
  `components/mdx/mdx-components.tsx`.
- `next.config.ts` sets `output: "standalone"` (CI and the browser gates serve
  `.next/standalone/server.js`) and the security headers: a CSP, `X-Frame-Options:
  DENY`, `nosniff`, a referrer policy, a same-origin resource policy, a permissions
  policy, and HSTS on Vercel.

## 4. Content pipeline

```
content/{projects,evals,timeline}.ts               → Zod .parse() at module load (build fails on invalid data)
content/resume.ts, site.ts, home-visual.ts, …      → typed `as const` modules, checked by tsc (no schema)
content/{writing,notes}/*.mdx                      → lib/mdx-collection.ts: fs read → compileMDX (frontmatter) → Zod
content/now.mdx                                    → lib/now.ts: compileMDX → NowSchema
case-study bodies                                  → components/case-studies/<slug>.tsx (props from content/)
assistant corpus                                   → lib/ai/retrieval.ts at module load: faq.json, projects/*.mdx,
                                                     profile.json, resume.ts, skills.json → BM25 index
```

Drafts (`draft: true`) are excluded from indexes, feeds, the sitemap, and generated routes
in production builds, and stay previewable in `next dev`. `public/llms.txt` is a
hand-maintained static file — no script generates it. Adding a project means a record in
`content/projects.ts`, a body in `components/case-studies/`, a diagram in
`components/diagrams/data/`, and a write-up in `content/projects/` for the assistant.

## 5. Client component allowlist

`"use client"` is permitted ONLY in these files (19 today):

- Navigation and chrome: `components/layout/header-shell.tsx`,
  `components/layout/mobile-nav.tsx`, `components/layout/nav-links.tsx`,
  `components/features/theme-toggle.tsx`.
- Assistant: `components/features/assistant.tsx` (launcher),
  `components/features/assistant-panel.tsx` (lazy, code-split),
  `lib/use-inert-background.ts`.
- Homepage: `components/home/boundary-inspector.tsx`.
- Case studies: `components/case-studies/walkthrough.tsx`,
  `components/case-studies/reading-outline.tsx`,
  `components/case-studies/demo-poster-preload.tsx`,
  `components/diagrams/system-diagram.tsx`.
- Small utilities: `components/features/copy-button.tsx`,
  `components/features/copy-email.tsx`, `components/features/writing-list.tsx` and
  `components/features/note-list.tsx` (filters),
  `components/features/resume-download-link.tsx` (analytics event).
- Error boundaries required by Next.js: `app/error.tsx`, `app/global-error.tsx`.

Client components take props; they never import `content/`. Anything else client-side
requires a spec change first.

## 6. Assistant data flow (detail in AI_ASSISTANT.md)

```
module load: content/ → passages → BM25 index (in memory, per server instance)
runtime:     AssistantPanel → POST /api/chat (Node.js)
             → rate limit → sanitize → injection screen
             → BM25 top-4 above the relevance floor
             → daily budget check → Gemini streamGenerateContent (system prompt + passages)
             → SSE: meta · token… · sources · done → panel renders text + source links
fallback:    no key / quota / error → best FAQ answer verbatim (or best passage) + citation
```

No vector DB, no embeddings (ADR-006). No conversation persistence server-side.

## 7. Environment & config

`GEMINI_API_KEY` (server only, optional) · `NEXT_PUBLIC_SITE_URL` (optional; defaults to
`https://mubin-attar.vercel.app`) · `ASSISTANT_DAILY_CAP` (optional; default 500) ·
`NEXT_PUBLIC_CAL_URL` and `NEXT_PUBLIC_BUTTONDOWN_USERNAME` (optional overrides of
`config/site.ts`). `lib/env.ts` parses the site URL and the cap with safe fallbacks — an
invalid value falls back to its default instead of failing the build or a request.
`config/site.ts` holds name, role, email, location, socials, integrations, the
availability line, and footer copy — by rule the ONLY non-`content/` place copy may
live. Some copy is still written inline (`app/privacy/page.tsx`, the assistant panel's
labels and starter questions). DEPLOY.md documents each variable.

## 8. SEO & machine-readability

- Metadata API per route; canonical URLs; `sitemap.ts` (published content only, with
  `lastModified` only where content carries a date); `robots.ts` (block `/api/`, `/dev/`).
- JSON-LD: `Person` + `WebSite` in the root layout, `BlogPosting` on writing and notes,
  `CreativeWork` on case studies, `BreadcrumbList` on detail pages.
- OG images per route through `lib/og.tsx` (`next/og`, light theme only).
- `public/llms.txt` + per-page clean semantics: visitors include AI screeners; the site
  must be as legible to them as to humans.

## 9. Error, empty, loading conventions

Static-first means loading states are rare; where present (the assistant), a pending
answer shows a mono "searching…" line until the first token arrives, no shimmer. `app/not-found.tsx`: one sentence + links to
Work, Writing, and Home. `app/error.tsx` and `app/global-error.tsx` offer a retry and a
real link home. Assistant errors: honest, small, and grounded — the route falls back to
site search instead of failing. Never a dead end.
