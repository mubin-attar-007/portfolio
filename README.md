# Portfolio — Mubin Attar

The personal portfolio of **Mubin Attar**, AI / ML Engineer. A single, fast page
that shows four production AI products and the engineering behind them.

Live: **[mubin-attar.vercel.app](https://mubin-attar.vercel.app)**

## The thesis: every number is real

The site has one rule that runs through the work it showcases — **every number a
user sees is genuinely computed, never faked**. The products linked here ship with
honest metrics: validated model accuracy, cost-and-slippage-aware backtests,
graded prediction track-records. This repo holds no mock data; all content lives
in one typed source of truth (`lib/content.ts`) so nothing drifts.

## Stack

- **[Next.js 16](https://nextjs.org)** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** for motion, **lucide-react** for icons
- SEO built in: `opengraph-image`, `sitemap`, `robots`, favicon
- Deployed on **Vercel**

## Project structure

```
app/         routes, layout, and SEO (og image, sitemap, robots)
components/   page sections (hero, projects, about, contact, …)
lib/          content.ts — the single source of truth for all copy & links
public/       static assets (resume, images)
test/         node:test guards for lib/content.ts
```

## Local development

Requires **Node 24+** (the test runner uses native TypeScript stripping).

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build
npm run lint     # eslint
npm test         # node:test — validates lib/content.ts
```

## Deploy

Pushes to `main` are built and deployed automatically by **Vercel**. CI
(`.github/workflows/ci.yml`) runs install → lint → build → test on every push
and pull request, so a broken build or a dead project link never reaches
production.
