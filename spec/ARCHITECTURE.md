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
│   ├── assistant/        # the assistant panel's parts, its copy, openAssistant()
│   ├── case-studies/     # one body per project, walkthrough, boundary inspector, reading outline
│   ├── diagrams/         # SystemDiagram + data/<slug>.ts
│   ├── features/         # assistant owner and panel, copy button, newsletter form, résumé download link
│   ├── flagship/         # the flagship case-study template: hero, tour and code galleries, recordings, sketch, highlights, record sections
│   ├── home/ about/ hire/ contact/ writing/ evals/ resume/ now/ trust/ misc/
│   │                     # one folder of sections per page or page family
│   ├── layout/           # nav pill and menus, mobile menu, footer, launcher, work sub-nav, section, container
│   ├── mdx/              # MDX component map, DecisionLog, FailureLog, prose classes
│   ├── motion/           # Marquee, Float, PulseRings
│   ├── seo/              # JSON-LD
│   ├── ui/               # primitives (design-system.md §5)
│   └── work/             # /work cards, demo player, "Ask AI about …" buttons, the reveal contract, CTA band
├── config/               # site.ts (identity, status, integrations), nav.ts
├── constants/            # the shared page-top class (page.ts), SEO limits (seo.ts), browser chrome (theme.ts)
├── content/              # typed content modules, Zod schemas, MDX, JSON, flagship/, pages/ (CONTENT_MODEL.md)
├── lib/                  # loaders, formatting, feeds, page metadata (seo.ts), env, analytics, hooks; ai/ (assistant)
├── public/               # résumé PDF, demo recordings + captions, flagship captures + recordings (showcase/), portrait, llms.txt
├── scripts/              # browser gates, Lighthouse + metadata gate, résumé PDF, icons, the assistant's live eval, Sites build staging
├── styles/               # tokens.css, globals.css
├── test/                 # node:test unit tests, fixtures (question sets, the assistant's golden set), alias loader
├── spec/                 # charter, standards, architecture, content model, assistant, ADRs
└── .github/              # workflows/ci.yml, workflows/keep-demos-alive.yml, dependabot.yml
```

## 3. Routes and rendering

Each page's visual pattern is in design-system.md §7.1.

| Route | Source | Notes |
|---|---|---|
| `/` | `content/pages/home.ts` and the registries | |
| `/work` | `content/pages/work.ts`, `content/flagship/`, `content/projects.ts` | The flagship products on a dark plate (`#flagship`), then the public systems (`#public`), then one line of technology per system |
| `/work/bench-discovery`, `/work/careltc` | `content/flagship/*.ts`, rendered by `components/flagship/` through `flagship-route.tsx` | The two flagship case studies, each a static route of its own (page and social card) under the work sub-nav |
| `/work/[slug]` | `content/projects.ts`, bodies in `components/case-studies/<slug>.tsx` | The four public case studies, under the work sub-nav; `generateStaticParams` lists only them (`dynamicParams = false`). Kept apart from the flagships so neither template's CSS or JavaScript loads on the other's pages. The DBWhisper boundary inspector lives on `/work/dbwhisper` |
| `/writing`, `/writing/[slug]` | `content/writing/*.mdx`, `content/pages/writing.ts` | The index has filter chips; `?type=essay`, `guide` or `note` preselects one |
| `/notes`, `/notes/[slug]` | `content/notes/*.mdx` | `/notes` renders the same writing index with Notes preselected. It is not a redirect, so it keeps its own title, description and social card. `/notes/[slug]` is unchanged |
| `/now` | `content/now.mdx`, `content/pages/now.ts` | |
| `/evals` | `content/evals.ts`, `content/pages/evals.ts` | Dark page |
| `/about`, `/hire`, `/contact` | `content/pages/{about,hire,contact}.ts`, `content/site.ts`, `content/resume.ts` | `/about` is a dark page. `/contact` is the contact funnel (`STATUS.href`) |
| `/trust`, `/uses` | `content/pages/{trust,uses}.ts`, `content/site.ts`, `content/evals.ts` | `/uses` links each tool to the case studies that list it (`components/misc/stack-evidence.ts`, CONTENT_MODEL.md §5) |
| `/resume`, `/skills` | `content/resume.ts`, `content/pages/resume.ts` | `/resume` renders the same data as the PDF. `/skills` marks each skill group against every case study in `WORK_ITEMS` order, from their own stacks (`components/misc/stack-evidence.ts`) |
| `/privacy` | Copy written in `app/privacy/page.tsx` | |
| `/dev/components` | Component preview, `noindex`, no canonical URL (ADR-007) | |
| `/api/chat` | Assistant route handler (AI_ASSISTANT.md) | |
| `/rss.xml`, `/writing/feed.xml` | RSS 2.0: writing + notes, and writing only | |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `*/opengraph-image` | Metadata routes | |
| `/favicon.ico`, `/icon.svg`, `/apple-icon.png` | `app/` icon files; the raster two are rendered from `app/icon.svg` (`npm run build:icons`) | |

Permanent redirects (`next.config.ts`): `/talks` and `/timeline` → `/about`,
`/changelog` → `/now` (consolidated routes), `/cv` → `/resume` (a path people
guess first), and the anonymous field-report drafts to the named flagship case
studies (`/work/field/records-triage` → `/work/bench-discovery`,
`/work/field/nfc-room-rounds` → `/work/careltc`). `/contact` became a page with ADR-018 and no longer redirects to
`/hire`: `/hire` is the careers-style page and `/contact` the funnel. The metadata
gate checks each redirect and that none is in the sitemap.

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
content/{projects,evals}.ts                        → Zod .parse() at module load (build fails on invalid data)
content/resume.ts, site.ts, pages/*, flagship/*    → typed modules (`as const` or a declared type), checked by tsc (no schema)
content/{writing,notes}/*.mdx                      → lib/mdx-collection.ts: fs read → compileMDX (frontmatter) → Zod
content/now.mdx                                    → lib/now.ts: compileMDX → NowSchema
case-study bodies                                  → public: components/case-studies/<slug>.tsx (props from content/);
                                                     flagship: one template, components/flagship/, fed by content/flagship/
assistant corpus                                   → lib/ai/corpus.ts at module load: faq.json, flagship/*, projects.ts +
                                                     projects/*.mdx, resume.ts, evals.ts, pages/{about,contact,hire,
                                                     trust,uses}.ts, site.ts, config/site.ts, now.mdx, published
                                                     writing/*.mdx and notes/*.mdx → BM25 index (lib/ai/retrieval.ts)
```

Drafts (`draft: true`) are excluded from indexes, feeds, the sitemap, and generated routes
in production builds, and stay previewable in `next dev`. `public/llms.txt` is a
hand-maintained static file in the llmstxt.org layout — no script generates it, so it
is served as-is by both the Vercel and the static Sites builds — and
`test/llms-txt.test.mts` fails when it misses a published page, flagship case study
(with its usage figure in the approved wording), project, essay, note or evaluation
row, or the notice-period line read from `STATUS.noticePeriod`, links a demo the site
no longer links, or (with `test/evidence.test.mts`) quotes a figure the registry does
not hold. Adding a public project means a record in
`content/projects.ts`, a body in `components/case-studies/`, a diagram in
`components/diagrams/data/`, and a write-up in `content/projects/` for the assistant.
Adding a flagship case study means a record in `content/flagship/<slug>.ts`, listed in
`flagships` (`content/flagship/index.ts`) with its slug in `FlagshipSlug` and its
approved usage figure in `USAGE` (`content/flagship/shared.ts`); its captures and
recordings under `public/showcase/<slug>/`; its menu line in `config/nav.ts`
(`FLAGSHIP_COPY`); its starter questions in `lib/ai/starters.ts`; its line in
`public/llms.txt`; and the disclosure rules of ADR-019.

## 5. Client component allowlist

`"use client"` is permitted ONLY in these files (31 today):

- Chrome: `components/layout/nav-link.tsx`, `components/layout/nav-menu.tsx`,
  `components/layout/mobile-menu.tsx`, `components/layout/subnav-scroller.tsx`,
  `components/layout/announcement-bar.tsx`, `components/layout/ask-launcher.tsx`,
  `components/layout/scroll-region.tsx` (measures whether a wide table overflows, so its
  scroller is a named region with a tab stop only then; /evals, /skills).
- Assistant: `components/features/assistant.tsx` (owner and header trigger),
  `components/features/assistant-panel.tsx` (lazy, code-split),
  `lib/use-inert-background.ts`, and the openers `components/contact/assistant-opener.tsx`,
  `components/home/agent-actions.tsx` and `components/writing/ask-assistant-button.tsx`.
- Primitives: `components/ui/sticky-steps.tsx`, `components/ui/toc.tsx`.
- Homepage: `components/home/showcase-tabs.tsx`, `components/home/prompt-chip.tsx`,
  `components/home/use-copy-prompt.ts`.
- Case studies: `components/case-studies/boundary-inspector.tsx`,
  `components/case-studies/walkthrough.tsx`, `components/case-studies/reading-outline.tsx`,
  `components/diagrams/system-diagram.tsx`, `components/work/demo-player.tsx`,
  `components/work/ask-ai.tsx` (the "Ask AI about <product>" button and question chips),
  `components/flagship/media-gallery.tsx` (the flagship tour, recordings and code tabs).
- Filters and small utilities: `components/writing/writing-filters.tsx`,
  `components/evals/evals-board.tsx`, `components/features/copy-button.tsx`,
  `components/features/resume-download-link.tsx` (analytics event).
- Error boundaries required by Next.js: `app/error.tsx`, `app/global-error.tsx`.

Client components take props and do not import a registry or a schema from `content/`
(design-system.md §9 explains the cost). Anything else client-side requires a spec
change first.

## 6. Assistant data flow (detail in AI_ASSISTANT.md)

```
module load: content/ → passages (lib/ai/corpus.ts) → BM25 index with spelling correction and
             aliases (lib/ai/retrieval.ts; in memory, per server instance)
runtime:     AssistantPanel → POST /api/chat { messages, page? } (Node.js) → lib/ai/chat-handler.ts
             → request screen (same-origin, JSON) → rate limit → sanitize → injection screen
             → a hiring term the site does not publish, or a private-life question
               → a fixed, grounded answer (lib/ai/intent.ts), no model call
             → retrieval (judged per question, follow-up aware, the open page as a prior)
               nothing found → one routing call over the passage titles (lib/ai/router.ts),
               only with a key, a topic and budget → still nothing → "not covered"
             → model-call reservation (per client and per instance; every call counts)
             → Gemini streamGenerateContent (system prompt + background profile + passages;
               a hedged second call after 3.5 s without text; 12 s first token, 25 s total)
             → SSE: meta · token… · sources · actions? · followups? · done
               → the panel renders the text, source chips, next-step actions, follow-up chips
fallback:    no key / quota / error / timeout / empty or blocked reply
             → best passage verbatim, with its citation, actions and follow-ups
```

No vector DB, no embeddings (ADR-006, amended 2026-11-17: the routing call is the
second chance instead). No conversation persistence server-side: the
transcript lives only in the launcher's memory (`components/features/assistant.tsx`),
which stays mounted across page changes, until the tab closes.

## 7. Environment & config

`GEMINI_API_KEY` (server only, optional) · `GEMINI_MODEL` (server only, optional; default
`gemini-3.5-flash-lite`) · `NEXT_PUBLIC_SITE_URL` (optional; defaults to
`https://mubin-attar.vercel.app`) · `ASSISTANT_DAILY_CAP` (optional; default 500 model
calls per instance per UTC day) · `ASSISTANT_CLIENT_DAILY_LIMIT` (optional; model calls
per visitor per UTC day, 30 in production and lifted to the instance cap under
`next dev`) · `NEXT_PUBLIC_BUTTONDOWN_USERNAME` (optional, no default: the newsletter
form renders only when it names a Buttondown handle). `lib/env.ts` parses the site URL,
the cap and the model, and `lib/ai/rate-limit.ts` the per-visitor limit, with safe
fallbacks — an invalid value (for the model, anything but a bare model id) falls back to
its default instead of failing the build or a request. `.env.example` also lists
`NEXT_PUBLIC_CAL_URL`, but no code reads it: the booking link is `INTEGRATIONS.calUrl` in
`config/site.ts`.
`config/site.ts` holds name, role, the site description, email, location, socials,
integrations, the availability line and the notice period (`STATUS`), and footer copy —
by rule the ONLY non-`content/` place copy may live. Some copy is still written outside
`content/`: `app/privacy/page.tsx`, the assistant's interface copy
(`components/assistant/copy.ts`) and its starter questions (`lib/ai/starters.ts`, shared
by the panel, the case-study chips and the retrieval test). DEPLOY.md documents each
variable.

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
  carries a date; a flagship's is its record's `updated`); `robots.ts` (block `/api/`,
  `/dev/`). The 404 and `/dev/components` are `noindex` with no canonical URL and no
  social card of their own. Both flagship case studies are published and indexed like
  any case study.
- JSON-LD: `Person` + `WebSite` in the root layout, `BlogPosting` on writing and notes,
  `CreativeWork` on the public case studies, `BreadcrumbList` on detail pages (a
  flagship case study carries `BreadcrumbList` only).
- OG images per route through one renderer, `renderOg` in `lib/og.tsx` (`next/og`,
  1200×630 PNG): the light canvas, a white panel whose hairline edges run out to the
  card's edges, a faint circuit sketch, the "MA" mark and name, a violet kicker naming the
  kind of page, the title in Geist 700 and one line under it. `/about` and `/evals` are
  dark pages and pass the dark tone. A route passes only its words. Satori cannot read
  custom properties, so the colours are literals named beside the tokens they mirror
  (design-system.md §11.1). `next/og` bundles only Geist Regular, so the card's three
  Geist weights are fetched as TrueType from Google Fonts when the image is rendered, with
  the GPOS table hidden so word spacing stays even. A flagship's card uses the kicker
  "Flagship case study · Sevina Technologies", its name and its one-line definition; a
  public case study's kicker is "Case study · <status>", and a "Deployed demo" status
  shows only while the project links a demo. Icons: the
  `app/icon.svg` mark, with `favicon.ico` and the 180px `apple-icon.png` rendered from
  it, and `app/manifest.ts` for home-screen shortcuts (opens as a browser tab).
- `npm run test:metadata` reads the sitemap and checks every URL against all of the
  above, plus the unindexed routes and every redirect (README, Checks).
- `public/llms.txt` + per-page clean semantics: visitors include AI screeners; the site
  must be as legible to them as to humans.

## 9. Error, empty, loading conventions

Static-first means loading states are rare; where present (the assistant), a pending
answer shows "Searching the site" with a subtle shimmer until the first token arrives
(static under reduced motion), and after 5 s without text it reads "Taking longer than
usual…". `app/not-found.tsx` is a dark page: a "404" drawn in
dots inside a dotted frame, one line, a link home, and links to Work, Writing and
Contact. `app/error.tsx` and `app/global-error.tsx` are the same family: "Something
went wrong", a retry, and the email address. Assistant errors: honest, small, and grounded — the route falls back to
site search instead of failing. Never a dead end.
