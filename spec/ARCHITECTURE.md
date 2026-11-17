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
├── app/                  # routes, layout, metadata, OG images, icons, manifest, feeds, /api/chat
├── components/
│   ├── case-studies/     # one body per project, walkthrough, reading outline
│   ├── diagrams/         # SystemDiagram + data/<slug>.ts
│   ├── features/         # assistant, theme toggle, copy buttons, lists, proof strip, timeline
│   ├── home/             # homepage sections, boundary inspector
│   ├── layout/           # header, footer, navigation, container, section
│   ├── mdx/              # MDX component map, DecisionLog, FailureLog, prose classes
│   ├── seo/              # JSON-LD
│   ├── ui/               # primitives: button variants, callout, metric, code block, …
│   └── work/             # ProjectCard
├── config/               # site.ts (identity, status, integrations), nav.ts
├── constants/            # shared class constants (page.ts, bands.ts), SEO limits (seo.ts), browser chrome (theme.ts)
├── content/              # typed content modules, Zod schemas, MDX, JSON (CONTENT_MODEL.md)
├── lib/                  # loaders, formatting, feeds, page metadata (seo.ts), env, analytics, hooks; ai/ (assistant)
├── public/               # résumé PDF, demo recordings + captions, portrait, llms.txt
├── scripts/              # browser gates, Lighthouse + metadata gate, résumé PDF, icons, Sites build staging
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
| `/dev/components` | Component preview, `noindex`, no canonical URL (ADR-007) |
| `/api/chat` | Assistant route handler (AI_ASSISTANT.md) |
| `/rss.xml`, `/writing/feed.xml` | RSS 2.0: writing + notes, and writing only |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `*/opengraph-image` | Metadata routes |
| `/favicon.ico`, `/icon.svg`, `/apple-icon.png` | `app/` icon files; the raster two are rendered from `app/icon.svg` (`npm run build:icons`) |

Permanent redirects (`next.config.ts`): `/talks` and `/timeline` → `/about` and
`/changelog` → `/now` (consolidated routes), `/contact` → `/hire` and `/cv` →
`/resume` (the paths people guess first; moving `/hire` itself remains the separate
decision ADR-015 §6 names). The metadata gate checks each one and that none is in
the sitemap.

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
assistant corpus                                   → lib/ai/corpus.ts at module load: faq.json, projects.ts +
                                                     projects/*.mdx, profile.json, resume.ts (roles, education,
                                                     skills), evals.ts, config/site.ts (contact), published
                                                     writing/*.mdx and notes/*.mdx → BM25 index (lib/ai/retrieval.ts)
```

Drafts (`draft: true`) are excluded from indexes, feeds, the sitemap, and generated routes
in production builds, and stay previewable in `next dev`. `public/llms.txt` is a
hand-maintained static file in the llmstxt.org layout — no script generates it, so it
is served as-is by both the Vercel and the static Sites builds — and
`test/llms-txt.test.mts` fails when it misses a published page, project, essay, note,
or evaluation row, links a demo the site no longer links, or (with
`test/evidence.test.mts`) quotes a figure the registry does not hold. Adding a project means a record in
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

Client components take props and do not import `content/` (design-system.md §9 explains
the cost). Known violation: `components/features/writing-list.tsx` imports copy
constants from `content/article.ts`. Anything else client-side requires a spec change
first.

## 6. Assistant data flow (detail in AI_ASSISTANT.md)

```
module load: content/ → passages (lib/ai/corpus.ts) → BM25 index (in memory, per server instance)
runtime:     AssistantPanel → POST /api/chat (Node.js) → lib/ai/chat-handler.ts
             → request screen (same-origin, JSON) → rate limit → sanitize → injection screen
             → retrieval (judged per question, follow-up aware;
               nothing relevant → "not covered", no model call)
             → live-answer reservation (per client, per instance)
             → Gemini streamGenerateContent (system prompt + passages; 8 s first token, 20 s total)
             → SSE: meta · token… · sources · done → panel renders text + source links
fallback:    no key / quota / error / timeout / empty or blocked reply
             → best passage verbatim + its citation
```

No vector DB, no embeddings (ADR-006). No conversation persistence server-side: the
transcript lives only in the launcher's memory (`components/features/assistant.tsx`),
which stays mounted across page changes, until the tab closes.

## 7. Environment & config

`GEMINI_API_KEY` (server only, optional) · `GEMINI_MODEL` (server only, optional; default
`gemini-3.5-flash-lite`) · `NEXT_PUBLIC_SITE_URL` (optional; defaults to
`https://mubin-attar.vercel.app`) · `ASSISTANT_DAILY_CAP` (optional; default 500) ·
`NEXT_PUBLIC_CAL_URL` (optional override of the booking link in `config/site.ts`) ·
`NEXT_PUBLIC_BUTTONDOWN_USERNAME` (optional, no default: the newsletter form renders
only when it names a Buttondown handle). `lib/env.ts` parses the site URL, the cap and the model with safe
fallbacks — an invalid value (for the model, anything but a bare model id) falls back to
its default instead of failing the build or a request.
`config/site.ts` holds name, role, the site description, email, location, socials,
integrations, the availability line, and footer copy — by rule the ONLY
non-`content/` place copy may live. Some copy is still written inline (`app/privacy/page.tsx`, the assistant panel's
labels); the starter questions live in `lib/ai/starters.ts`, shared by the panel and
the retrieval test. DEPLOY.md documents each variable.

## 8. SEO & machine-readability

- **Every public page builds its metadata with `pageMetadata`** (`lib/seo.ts`): its own
  canonical URL and og:url, a complete social card (site name, `en_US` locale, type,
  title, description; articles add their dates and tags), and RSS discovery. Next
  merges metadata shallowly — a page's `openGraph` or `alternates` replaces the root's
  whole — so the root layout sets only defaults true of any page and never a URL; a
  root canonical was once inherited by the 404 and `/dev/components`.
- Titles fit a results page: at most 60 characters with the " · Mubin Attar" suffix,
  which `documentTitle` drops rather than let the page's own name be cut.
  Descriptions are 50–160 characters (`constants/seo.ts`): project and writing
  summaries are capped at 160 by their schemas; a note uses its optional `summary`,
  else its opening sentences (`noteDescription`, `lib/excerpt.ts`) — never its tags.
  The same description feeds the meta tag, the social card, the structured data, and
  `/rss.xml`. `SITE.description` is the homepage's and the default.
- `sitemap.ts` (published content only, with `lastModified` only where content
  carries a date); `robots.ts` (block `/api/`, `/dev/`). The 404 and `/dev/components`
  are `noindex` with no canonical URL and no social card of their own.
- JSON-LD: `Person` + `WebSite` in the root layout, `BlogPosting` on writing and notes,
  `CreativeWork` on case studies, `BreadcrumbList` on detail pages.
- OG images per route through `lib/og.tsx` (`next/og`, light theme only). Icons: the
  `app/icon.svg` mark, with `favicon.ico` and the 180px `apple-icon.png` rendered from
  it, and `app/manifest.ts` for home-screen shortcuts (opens as a browser tab).
- `npm run test:metadata` reads the sitemap and checks every URL against all of the
  above, plus the unindexed routes and every redirect (README, Checks).
- `public/llms.txt` + per-page clean semantics: visitors include AI screeners; the site
  must be as legible to them as to humans.

## 9. Error, empty, loading conventions

Static-first means loading states are rare; where present (the assistant), a pending
answer shows a mono "searching…" line until the first token arrives, no shimmer.
`app/not-found.tsx`: the shared page header, then links to Home, the primary
navigation, and every case study. `app/error.tsx` and `app/global-error.tsx` offer a
retry and a real link home. Assistant errors: honest, small, and grounded — the route falls back to
site search instead of failing. Never a dead end.
