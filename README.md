# Portfolio — Mubin Attar

The personal site of **Mubin Attar**, AI / ML Engineer. Case studies of four
production AI products, the architecture behind them, and the decisions that
shaped them.

Live: **[mubin-attar.vercel.app](https://mubin-attar.vercel.app)**

## The thesis: every number is real

One rule runs through the site — **every number a visitor sees is genuinely
computed, and links to how it was measured**. That is enforced, not promised:
content is validated by Zod at module load, and `MetricSchema.method` is a
required non-empty string, so **a metric without a stated method fails the
build**. There is no mock data in this repo.

## Stack

- **[Next.js 16](https://nextjs.org)** (App Router) + **React 19**
- **TypeScript** (strict)
- **Tailwind CSS v4**, configured CSS-first through `@theme` in `styles/tokens.css`
- **MDX** via `next-mdx-remote/rsc`, **Zod** for content schemas
- **Shiki** for syntax highlighting — at render time, so no highlighter ships to the browser
- **lucide-react** for icons. No animation library: motion is CSS plus one `IntersectionObserver`
- **Gemini** for the grounded assistant, over an in-repo BM25 retrieval index
- SEO built in: per-route `opengraph-image`, `sitemap`, `robots`, RSS, JSON-LD
- Deployed on **Vercel**

## Project structure

```
app/           routes, layout, OG images, feeds, /api/chat
components/    ui/ layout/ features/ diagrams/ mdx/ case-studies/ seo/
content/       all copy — MDX bodies, typed data, schema.ts (Zod)
lib/           content loaders, formatting, OG rendering, lib/ai/*
config/        site identity and nav
styles/        tokens.css (design tokens), globals.css
scripts/       a11y gate, resume PDF build
test/          node:test suites over lib/ and content schemas
```

Everything is statically generated except `/api/chat`. See
[`docs/12_ARCHITECTURE.md`](docs/12_ARCHITECTURE.md).

## Local development

Requires **Node 24+** (the test runner uses native TypeScript stripping).

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build — fails on invalid content
npm run lint       # eslint
npm test           # node:test — lib/ + content schema fixtures
npm run test:a11y  # axe-core WCAG 2.2 AA gate; needs a server on :3200
npx tsc --noEmit   # type check
```

## Documentation

`/docs` is the source of truth. Start with
[`12_ARCHITECTURE.md`](docs/12_ARCHITECTURE.md),
[`02_DESIGN_SYSTEM.md`](docs/02_DESIGN_SYSTEM.md), and
[`13_DESIGN_DECISIONS.md`](docs/13_DESIGN_DECISIONS.md).
`spec/` holds the older, longer-form specification and remains useful as
engineering reference; where the two disagree, `/docs` and `CLAUDE.md` win.

## CI and deploy

`.github/workflows/ci.yml` runs on every push to `main` and every pull request:
install → lint → type-check → test → build → **accessibility gate** (axe-core
across all routes in light and dark). A WCAG 2.2 AA violation fails the build.

Vercel builds and deploys from `main`. See [`DEPLOY.md`](DEPLOY.md).
