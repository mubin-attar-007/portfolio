# Architecture

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind v4.
Everything is statically generated except one route.

---

## Folder structure

Root-level, no `src/`. The `@/*` path alias points at the repo root.

| Folder | Responsibility |
| --- | --- |
| `app/` | Routes, layout, metadata, OG images, feeds, the one API route |
| `components/ui/` | Primitives: button, card, callout, metric, code-block, tag, figure, pull-quote, section-heading, page-header, before-after, boundary-mark |
| `components/layout/` | Container, section, header, footer, nav (desktop + mobile), logo |
| `components/features/` | Interactive units: assistant, theme toggle, FAQ, reveal observer, copy buttons, list filters, hero terminal, capability grid |
| `components/diagrams/` | `system-diagram.tsx` — a typed, hand-rolled SVG renderer; node/edge data in `diagrams/data/` |
| `components/mdx/` | MDX component map + MDX-only blocks (decision log, failure log) |
| `components/case-studies/` | Per-project layout modules, one per project + a generic fallback |
| `components/seo/` | JSON-LD structured data |
| `content/` | All copy: MDX bodies, typed `.ts`/`.json` data, and `schema.ts` |
| `lib/` | Content loaders (`writing`, `notes`, `now`), `format`, `og.tsx`, and `lib/ai/*` |
| `config/` | `site.ts` (identity, URL, socials), `nav.ts` |
| `styles/` | `tokens.css` (design tokens), `globals.css` (base + effects) |
| `scripts/` | `a11y.mjs` (axe gate), `build-resume-pdf.mts` |
| `test/` | `node --test` suites over `lib/` and content schemas |

There is no `constants/`, no `types/`, and no route group. Types live beside the
code that owns them; constants sit at the top of their module.

---

## Routes

| Route | Kind |
| --- | --- |
| `/` | static |
| `/work`, `/work/[slug]` | static, `dynamicParams = false` |
| `/writing`, `/writing/[slug]` | static, `dynamicParams = false` |
| `/notes`, `/notes/[slug]` | static, `dynamicParams = false` |
| `/about` `/hire` `/resume` `/timeline` `/now` `/uses` `/talks` `/evals` | static |
| `/dev/components` | static kitchen sink, noindex |
| `/sitemap.xml` `/robots.txt` | generated (`sitemap.ts`, `robots.ts`) |
| `/rss.xml` `/writing/feed.xml` | `dynamic = "force-static"` |
| `/api/chat` | **the only dynamic route** — `force-dynamic`, `runtime = "nodejs"` |

Each route also owns an `opengraph-image.tsx`, generated at build through
`lib/og.tsx`.

`/api/chat` needs Node (the retrieval index reads `content/` with `fs`) and is
inherently per-request (reads a body, rate-limits by IP). Nothing else is.

---

## Rendering strategy

- **Server Components by default.** `"use client"` appears in 18 leaves only —
  each owns real browser state: theme, disclosure, intersection observer,
  clipboard, filter input, streaming chat.
- **Static generation everywhere.** Dynamic segments enumerate through
  `generateStaticParams()` and set `dynamicParams = false`, so an unknown slug is
  a build-time 404 rather than a runtime render.
- **No client data fetching** outside the assistant. Pages are HTML at rest.
- **Syntax highlighting never ships to the browser.** `components/ui/code-block.tsx`
  calls Shiki's `codeToHtml` during render and emits dual light/dark themes as CSS
  variables. Zero highlighting JS reaches the client.

---

## Content pipeline

```
content/*.mdx           ──▶ next-mdx-remote/rsc compileMDX ──▶ RSC tree
content/schema.ts (Zod) ──▶ .parse() at module load        ──▶ build fails on bad content
```

- Frontmatter and typed data are validated by Zod schemas in `content/schema.ts`.
  Parsing happens at module load, so **invalid content breaks the build** instead
  of rendering something wrong. That is the point of having no CMS.
- `lib/mdx-collection.ts` is the single MDX collection loader: read from disk,
  compile MDX, `.parse()` the frontmatter, sort newest-first, and resolve drafts.
  `lib/writing.ts` and `lib/notes.ts` are thin bindings of it to a directory and a
  schema; `lib/now.ts` is a single document and stands alone.
- `draft: true` means **unpublished, not merely unlisted**: excluded from the index,
  the feeds, the sitemap, and `generateStaticParams`, and `load()` refuses it, so a
  guessed URL 404s. Drafts stay reachable in `next dev` for preview only.
- `lib/feed.ts` renders both RSS feeds (`/rss.xml`, `/writing/feed.xml`) — one
  escaper, one item template, one channel envelope.
- `components/mdx/mdx-components.tsx` maps the component set authored content may
  use, so MDX cannot introduce off-system markup.
- Schema rules encode content law — `MetricSchema.method` is `z.string().min(1)`,
  so **a metric without a stated method cannot build**.

---

## Assistant data flow

`POST /api/chat`, streaming SSE. No vector database, no embedding API, no network
call in the retrieval step.

```
request
  └─ rate limit by IP           lib/ai/rate-limit.ts   in-memory sliding window, 15/min
  └─ sanitize + length cap      lib/ai/guard.ts
  └─ injection screen           lib/ai/guard.ts        refuse WITHOUT calling the model
  └─ retrieve top-k passages    lib/ai/retrieval.ts    BM25 over content/, k = 4
  └─ daily budget check         lib/ai/rate-limit.ts   UTC-day counter, hard cost ceiling
  └─ generate                   lib/ai/gemini.ts       Gemini streamGenerateContent (SSE)
  └─ stream                                            SSE events: meta, token, sources, done
```

**Retrieval (`lib/ai/retrieval.ts`)** builds an in-memory corpus at module load
from three real origins — `content/faq.json`, `content/projects/*.mdx` chunked by
`##` heading, and the profile / résumé / skills JSON — then indexes it with BM25
(`k1 = 1.5`, `b = 0.75`, small stopword list). `retrieve()` is deterministic and
network-free, which is what makes `test/retrieval.test.mts` possible at all.

A tuned relevance floor (`RELEVANCE_MIN_SCORE`) makes an off-topic query return
`[]`, so the assistant can honestly say "that's not on the site" instead of
streaming a weakly-related passage.

**It never 500s.** Every degraded path answers deliberately — a cited fallback
where an answer is possible, an honest status code where it is not:

| Condition | Response |
| --- | --- |
| Rate-limited | `429` + `Retry-After`; the panel shows the real wait |
| Injection detected | refusal; the model is never called |
| Daily budget exhausted | best retrieved FAQ answer, verbatim + citation |
| Gemini error / quota / network | same grounded fallback, `mode: "fallback"` |

The Gemini key is server-side only and is never logged, thrown, or returned.

---

## State, assets, theme

- **State**: no global store. Server props flow down; local `useState` in the few
  client leaves. The assistant owns its own stream state.
- **Theme**: `[data-theme]` on `<html>`, written pre-paint by a small inline
  script in `app/layout.tsx` reading `localStorage.theme`. `prefers-color-scheme`
  is deliberately ignored — see `13_DESIGN_DECISIONS.md`.
- **Fonts**: Geist Sans + Geist Mono self-hosted via the `geist` package;
  Newsreader (italic display) via `next/font/google`. Both are self-hosted at
  build, so no font request leaves the origin at runtime.
- **Icons**: `lucide-react`, imported per icon.
- **Animations**: CSS only, plus one `IntersectionObserver`
  (`components/features/reveal-observer.tsx`) that adds `.reveal-in`. No
  animation library is installed.
- **Security headers**: CSP and friends are set in `next.config.ts`.

---

## Verification

```bash
npx tsc --noEmit
npm run lint
npm test            # node --test over lib/ + content schemas
npm run test:a11y   # axe-core WCAG 2.2 AA gate; needs a server on :3200
```
