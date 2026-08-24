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
npx tsc --noEmit   # type check
```

The gates below need a production server on `:3200`
(`npm run build && PORT=3200 node .next/standalone/server.js`):

```bash
npm run test:a11y         # axe-core WCAG 2.2 AA — 18 routes x 2 themes x 3 viewports
npm run test:hue          # accent-drift guard; THEME=light|dark
npm run test:interaction   # 26 behaviour contracts: reveals, specimen, modals
npm run test:screens      # 6 widths x 2 themes; horizontal overflow + console errors
npm run test:print        # /resume prints as a document, not a screenshot
npm run test:metadata     # OG images, titles, indexing/freshness
npm run test:lighthouse   # perf/a11y/SEO budgets (CI numbers are the real ones)
```

## Documentation

Start with [`design-system.md`](design-system.md) — the shipped design system,
kept in step with `styles/tokens.css`.

Every significant decision is an ADR in
[`spec/decisions/`](spec/decisions/). Read them newest-first; a later ADR that
amends an earlier one says so in its Status line. The current identity is
[ADR-011](spec/decisions/ADR-011-evidence-paths-identity.md), the reference
fidelity work is [ADR-012](spec/decisions/ADR-012-clerk-fidelity.md), the
palette is [ADR-013](spec/decisions/ADR-013-openrouter-palette.md), and motion,
disclosure and modal semantics are
[ADR-014](spec/decisions/ADR-014-motion-and-modality.md).

`spec/` also holds the longer-form specification —
[`ARCHITECTURE.md`](spec/ARCHITECTURE.md), [`ENGINEERING.md`](spec/ENGINEERING.md),
[`CONTENT_MODEL.md`](spec/CONTENT_MODEL.md), [`DESIGN.md`](spec/DESIGN.md) — and
`docs/flagship-transformation/` holds the audit trail from the redesign program.
Where any two disagree, the newest ADR and `CLAUDE.md` win.

## CI and deploy

`.github/workflows/ci.yml` runs on every push to `main` and every pull request:
install → type-check → lint → test → build → **browser gates** → Lighthouse.

The browser gates run against one production server and any of them fails the
build: **accessibility** (axe-core, 18 routes × 2 themes × 3 viewports, plus both
dialog states), **interaction** (26 behaviour contracts), **accent drift** (both
themes), and **print**. `npm run test:screens` is deliberately local — it writes
144 files and is the slowest of the set.

Lighthouse numbers from CI are the ones that count; a local run on a developer
machine reports performance 20-25 points lower for reasons that do not transfer
(see ADR-014 § Consequences).

Vercel builds and deploys from `main`. See [`DEPLOY.md`](DEPLOY.md).
