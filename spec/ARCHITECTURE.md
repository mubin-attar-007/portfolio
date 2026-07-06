# ARCHITECTURE.md — System design

## 1. Stack (decisions recorded in spec/decisions/)

| Layer | Choice | ADR |
|---|---|---|
| Framework | Next.js 15+ App Router, React 19 | ADR-001 |
| Language | TypeScript strict | — |
| Styling | Tailwind CSS v4, CSS-first tokens | ADR-002 |
| Content | MDX + `@content-collections` + Zod | ADR-003 |
| Repo shape | Single app (no monorepo) | ADR-004 |
| Diagrams | Custom `SystemDiagram` (SVG/HTML) | ADR-005 |
| Assistant | Build-time embeddings → static index → edge route → Anthropic API | ADR-006 |
| Component preview | `/dev/components` route (no Storybook) | ADR-007 |
| Code highlighting | Shiki (build-time) | ADR-008 |
| Testing | Vitest · Testing Library · Playwright + axe | — |
| Hosting | Vercel (static + edge functions) | — |

## 2. Repository structure

```
.
├── CLAUDE.md
├── spec/
├── content/                     # ALL site copy (see CONTENT_MODEL.md)
│   ├── projects/ *.mdx
│   ├── writing/ *.mdx           # categories: essay | guide | note
│   ├── timeline/ *.md
│   ├── site/ home.md, about.md, now.md, contact.md
│   └── resume/ resume.md (+ /public/resume.pdf)
├── public/                      # static assets, recordings (*.cast), og/, llms.txt (generated)
├── scripts/
│   ├── build-embeddings.ts      # content → chunks → vectors → src/generated/search-index.json
│   ├── build-llms-txt.ts
│   └── check-links.ts
├── src/
│   ├── app/
│   │   ├── (site)/              # public routes
│   │   │   ├── page.tsx                     # home
│   │   │   ├── work/ page.tsx, [slug]/page.tsx
│   │   │   ├── writing/ page.tsx, [slug]/page.tsx
│   │   │   ├── about/ page.tsx
│   │   │   ├── timeline/ page.tsx
│   │   │   └── lab/ page.tsx                # P3, stub until built
│   │   ├── api/ask/route.ts                 # edge runtime
│   │   ├── og/[...slug]/route.tsx           # dynamic OG images (satori)
│   │   ├── sitemap.ts · robots.ts · not-found.tsx
│   │   └── dev/components/page.tsx          # kitchen sink (noindex, hidden in prod nav)
│   ├── components/{ui,layout,sections,diagrams,mdx,features}/
│   ├── content-collections.ts   # schemas
│   ├── lib/                     # pure, tested: search.ts, rate-limit.ts, seo.ts, format.ts
│   ├── config/ site.ts, nav.ts
│   ├── constants/
│   ├── styles/ tokens.css, globals.css
│   ├── generated/               # search-index.json (gitignored, built)
│   └── types/
└── .github/workflows/ci.yml
```

## 3. Rendering strategy

- Everything content is **statically generated** at build. No runtime CMS, no client
  fetching for content, no loading spinners on content routes.
- Server Components by default. RSC renders MDX via the component map in `components/mdx/`.

## 4. Content pipeline

```
content/**.mdx
   → content-collections (Zod validation — build FAILS on schema errors)
   → MDX compile: remark-gfm, rehype-slug, heading anchors, footnotes, Shiki
   → typed collections consumed by routes
   → scripts/build-embeddings.ts chunks the same collections → search-index.json
   → scripts/build-llms-txt.ts emits public/llms.txt from collections + site config
```

One source of truth (`content/`) feeds pages, search, the assistant, llms.txt, OG images,
and the sitemap. Adding a case study = adding one MDX file.

## 5. Client component allowlist ("use client" permitted ONLY here)

`ThemeToggle` · `MobileNav` · `SystemDiagram` (interactive layer; server-rendered fallback
list for no-JS) · `TerminalRecording` (lazy asciinema) · `AssistantPanel` (lazy, code-split)
· `CopyButton` · `ReadingProgress` (case studies, subtle) · Lab experiments (P3).
Anything else client-side requires a spec change first.

## 6. Assistant data flow (detail in AI_ASSISTANT.md)

```
build time:  content → chunk (~600 tokens, 15% overlap) → embed → search-index.json (vectors + metadata)
runtime:     AssistantPanel → POST /api/ask (edge)
             → embed query → cosine top-k over static index (in-memory)
             → Claude (system prompt + retrieved chunks + citations contract)
             → stream response → panel renders text + source chips (links into site)
```

No vector DB (index < 1k chunks — ADR-006). No conversation persistence server-side.
Rate limit: sliding window per hashed IP (`lib/rate-limit.ts`), plus per-day cost cap →
graceful "assistant is resting" state that degrades to client-side keyword search.

## 7. Environment & config

`ANTHROPIC_API_KEY` (server only) · `VOYAGE_API_KEY` (build + edge, embeddings) ·
`NEXT_PUBLIC_SITE_URL`. All access through `src/config/env.ts` with Zod validation —
crash at build/boot on missing vars, never at request time. `src/config/site.ts` holds
name, headline, socials, nav — the ONLY non-`content/` place copy may live.

## 8. SEO & machine-readability

- Metadata API per route; canonical URLs; `sitemap.ts`; `robots.ts` (block `/dev`, `/api`).
- JSON-LD: `Person` on home/about, `Article` on writing, `CreativeWork`/`Project` on case studies.
- Dynamic OG images (satori): headline set in Geist on paper background — light theme, on-brand.
- `public/llms.txt` + per-page clean semantics: 2026 visitors include AI screeners; the
  site must be as legible to them as to humans.

## 9. Error, empty, loading conventions

Static-first means loading states are rare; where present (assistant), skeleton = text
lines, no shimmer. `not-found.tsx`: one sentence + links to Work/Writing/Home. Assistant
errors: honest, small, retry + fallback search. Never a dead end.
