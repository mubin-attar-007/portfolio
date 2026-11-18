# Portfolio — Mubin Attar

The personal site of **Mubin Attar, Applied AI Engineer**: three flagship case studies
(Bench Discovery, CareLTC and SignFlow, products in use built at Sevina Technologies), four
public case studies, an evaluation registry, professional experience, technical
writing, and a grounded assistant that answers questions about the work.

The visual system is light-only with dark plates and three dark pages, built to a
Clerk-grade bar from the approved prototype in `spec/prototype/`
([ADR-018](spec/decisions/ADR-018-clerk-grade-visual-system.md),
[design-system.md](design-system.md)).

Production: [mubin-attar.vercel.app](https://mubin-attar.vercel.app).

## Stack

Next.js 16 (App Router), React 19, strict TypeScript, Tailwind CSS v4 with CSS
tokens, MDX through `next-mdx-remote`, Zod, and Shiki. Pages are server
components; client code is limited to the allowlist in
[spec/ARCHITECTURE.md §5](spec/ARCHITECTURE.md#5-client-component-allowlist).
Fonts are self-hosted through `next/font`.

The `/api/chat` assistant answers only from the site's own content (the flagship and
public case studies, the résumé and skills, the evaluation registry, the hiring,
contact and about pages, essays and notes, the FAQ). An in-memory BM25 index, with
spelling correction and content-backed aliases, finds the passages; when it finds
nothing, one small routing call can pick them from an index of passage titles.
Gemini (`gemini-3.5-flash-lite`) writes a cited answer, with a hedged second call
when the first is slow. The panel is page-aware: on a case study, an essay or a note
it opens on that page's own starter questions and favours that page's passages. Answers
end with source chips, next-step actions chosen from the question (email, a call, the
résumé, a case study) and curated follow-up questions. With no key or quota it serves
grounded site-search answers — the best passage, verbatim, with its source. A
67-question golden set evaluates it: offline in `npm test`, live with
`npm run eval:assistant`. See [spec/AI_ASSISTANT.md](spec/AI_ASSISTANT.md).

## Repository map

| Location | Responsibility |
| --- | --- |
| `app/` | Routes, layout, metadata, OG images, feeds, `/api/chat` |
| `components/` | UI primitives (`ui/`), chrome (`layout/`), motion, one folder of sections per page, the flagship case-study template (`flagship/`), public case-study bodies, diagrams, assistant |
| `config/site.ts`, `config/nav.ts` | Identity, the availability line and notice period, integrations, navigation |
| `constants/` | Shared class strings, search-result limits (`seo.ts`), browser-chrome colours (`theme.ts`) |
| `content/flagship/*.ts` | The three flagship case studies (Bench Discovery, CareLTC, SignFlow): one record each, the approved wording they share (`USAGE`, the employer, the private-repository notice), the template's labels and anchors, and a plain-text reader (`sections.ts`) |
| `content/projects.ts` | Canonical records and card content for the four public projects |
| `content/resume.ts` | Canonical résumé, used by pages, retrieval, and the PDF |
| `content/evals.ts`, `content/schema.ts` | Evaluation registry and the Zod content schemas |
| `content/pages/*.ts` | One copy module per page (home, about, hire, contact, work, writing, evals, résumé, now, trust, uses) |
| `content/*.ts` (other) | Shared and article copy; illustrative inspector and walkthrough data |
| `content/writing`, `content/notes`, `content/now.mdx` | Essays, notes, and the `/now` page (MDX) |
| `content/projects/*.mdx` | Long-form summaries of the public projects for assistant retrieval |
| `content/faq.json` | The FAQ; it feeds the assistant only. (`content/profile.json` is still in the tree, but nothing reads it.) |
| `lib/` | Content loaders, formatting, analytics, env parsing, assistant (`lib/ai/`) |
| `styles/` | `tokens.css` and `globals.css` |
| `scripts/`, `test/` | Browser gates, Lighthouse, the résumé PDF, the assistant's live evaluation, and `node:test` unit tests |
| `public/showcase/` | The flagship captures (WebP), recordings (WebM), posters and caption tracks (WebVTT), all on dummy data |
| `spec/` | Charter, engineering rules, architecture, content model, assistant, decisions |

Read [AGENTS.md](AGENTS.md) and the installed Next.js guides under
`node_modules/next/dist/docs/` before changing framework APIs.

## Run locally

Use **Node 24**, matching CI and the native TypeScript test runner.

```bash
npm ci
npm run dev       # http://localhost:3000
```

Copy `.env.example` to `.env.local` to set the optional assistant key and
overrides; [DEPLOY.md](DEPLOY.md) describes each variable.

## Checks

```bash
npx tsc --noEmit
npm run lint      # ESLint; skips the build output, spec/prototype and the git-ignored .local/
npm test          # node:test unit tests (test/*.test.mts)
npm run build
npm run test:copy # prerendered HTML: no words run together around inline elements
```

Browser gates run against a production server and take `BASE_URL`
(CI uses the standalone server on port 3200): `test:a11y`, `test:interaction`,
`test:motion`, `test:hue` (the site is light-only), `test:print`,
`test:screens`, `test:links`, and `test:smoke` (which also fails on any console
warning). `test:lighthouse` and `test:metadata` start their own standalone server
from the build unless `LIGHTHOUSE_BASE_URL` points at one. `test:metadata` reads
the sitemap and checks every URL — one canonical equal to the URL, og:url, a
complete social card whose image loads, RSS discovery, one h1, a title of at most
60 characters and a 50–160 character description (`constants/seo.ts`), parseable
structured data — plus noindex and no canonical on the 404, `/dev/components` and
any case study `/work` links to that the sitemap does not list (a draft; there is none
today), and every redirect in `next.config.ts` (the old field-report URLs included).

The assistant's live evaluation runs by hand, never in CI:

```bash
npm run eval:assistant                     # live: needs GEMINI_API_KEY in .env.local
npm run eval:assistant -- --mode fallback  # site search only, no model
npm run eval:assistant -- --mode offline   # the fake model the CI gate uses
```

It sends the 67-question golden set (`test/fixtures/assistant-golden.ts`) through the
real handler in-process, paced to `--rpm` model calls a minute (10 by default;
`--only` and `--label` narrow and name a run). A live run spends the key's quota. The
npm script loads `.env.local` when it exists, and the report is written to the
git-ignored `.local/evals/`. `npm test` already runs the same set offline, with a fake
model and with no key; spec/AI_ASSISTANT.md §8 describes the scoring.

The résumé PDF is generated from `content/resume.ts`, `config/site.ts`, the flagship
records and the eval registry. When any of them changes, run `npm run build:resume`
(which prints the document `scripts/resume-document.mts` renders) and commit the PDF
together with `scripts/resume-pdf.lock.json`; `npm test` fails until you do. The build
fails, writing nothing, unless the résumé fits exactly one A4 page, and it warns about
a bullet longer than two lines and about a one-word last line. The phone number appears
whole only in that PDF: the document module holds it in parts, and
`test/resume-phone.test.mts` fails if any source, doc or public text file carries it.

The raster icons — `app/favicon.ico` (16, 32, 48px) and `app/apple-icon.png`
(180px) — are rendered from `app/icon.svg`. After changing the mark or its
palette, run `npm run build:icons` and commit them with `scripts/icons.lock.json`;
`npm test` fails until you do.

`public/llms.txt` is written by hand; `npm test` fails when it misses a published
page, a flagship case study with its usage figure in the approved wording, or an
evaluation row, when its notice period differs from `STATUS.noticePeriod`, or when it
quotes a figure that disagrees with `content/evals.ts`.

## Routes

| Route | Page |
| --- | --- |
| `/` | Home |
| `/work`, `/work/bench-discovery`, `/work/careltc`, `/work/signflow`, `/work/[slug]` | The work overview, the three flagship case studies (static routes of their own) and the four public case studies (DBWhisper, TradePulse, CrownWager, LLM Studio; `/work/[slug]`). The old field-report URLs, `/work/field/records-triage` and `/work/field/nfc-room-rounds`, redirect (308) to the flagships |
| `/evals` | The evaluation registry |
| `/writing`, `/writing/[slug]`, `/notes`, `/notes/[slug]` | Essays, guides and notes; `/notes` is the writing index with Notes selected |
| `/about`, `/hire`, `/contact` | About, the careers-style hire page, and the contact funnel |
| `/resume`, `/now`, `/uses`, `/skills`, `/trust`, `/privacy` | Résumé, now, stack, capability map, evidence, privacy |
| `/evaluate` | Evaluate the work with your own AI: the prompt to copy, prompts to try, what the AI reads |
| `/rss.xml`, `/writing/feed.xml`, `/sitemap.xml`, `/llms.txt` | Feeds and machine-readable indexes |

Details, redirects and rendering: [spec/ARCHITECTURE.md §3](spec/ARCHITECTURE.md#3-routes-and-rendering).

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on pushes to `main`,
on pull requests, and on manual dispatch: type-check, lint, unit tests, build, the
copy gate over the prerendered HTML, then one standalone server for the browser
gates — accessibility, interaction,
motion, accent drift, print, internal links, metadata, and the
smoke test. The Lighthouse budget (which repeats the metadata gate) runs on pushes
to `main` and on pull requests that target `main`. A failed run uploads the server log and the
`.screenshots/` folder (the print gate's PDFs) as an artifact. A separate `audit` job
fails on any high or critical advisory in the production dependencies
(`npm audit --omit=dev --audit-level=high`).

[`.github/workflows/keep-demos-alive.yml`](.github/workflows/keep-demos-alive.yml)
runs on a schedule to keep the project demos' free Hugging Face Space backends
awake, and fails — so GitHub notifies the owner — when a demo stays down. The
comments in that file explain the optional `HF_TOKEN` repository secret.

## Deploy

[DEPLOY.md](DEPLOY.md) covers Vercel configuration, environment variables, the
assistant's degraded modes, and post-deploy checks. Vercel is the only target
that runs the whole app, including `/api/chat`. `npm run build:sites` builds an
OpenNext (Cloudflare) bundle and stages a static copy in `dist/` — prerendered
pages behind an asset-only worker, with no assistant route; publishing either is
a separate step.

## Documentation

- [design-system.md](design-system.md) — tokens, typography, components, motion, page patterns, and the design law
- [spec/PROJECT_CHARTER.md](spec/PROJECT_CHARTER.md) — purpose, audiences, principles
- [spec/ENGINEERING.md](spec/ENGINEERING.md) — standards, budgets, testing, workflow
- [spec/ARCHITECTURE.md](spec/ARCHITECTURE.md) — structure, routes, rendering, configuration
- [spec/CONTENT_MODEL.md](spec/CONTENT_MODEL.md) — content files and schemas
- [spec/AI_ASSISTANT.md](spec/AI_ASSISTANT.md) — the `/api/chat` assistant
- [spec/decisions/](spec/decisions/README.md) — architecture decision records
- [CLAUDE.md](CLAUDE.md) and [AGENTS.md](AGENTS.md) — instructions for coding agents
