# ENGINEERING.md — Standards, budgets, workflow

These are laws, not suggestions. The site must itself be evidence of engineering quality.

## 1. TypeScript

`tsconfig.json` runs `strict` plus `noUncheckedIndexedAccess`, `noImplicitOverride`,
`noFallthroughCasesInSwitch`, `verbatimModuleSyntax`, and `isolatedModules`.
No `any`. No `@ts-ignore` (only `@ts-expect-error` with a trailing reason). All exported
APIs explicitly typed. Content collections are validated with Zod (`content/schema.ts`)
and their types are inferred with `z.infer` — never duplicated by hand.

## 2. Code rules

- Server Components first. Client components only per ARCHITECTURE.md §5, as leaf nodes.
- No duplicated logic or styles: extract on second occurrence (`lib/`, `components/ui/`).
- No magic numbers/strings — `constants/`, `config/`, or tokens.
- Composition over inheritance; no prop drilling past 2 levels (compose or context).
- Files are kebab-case (`components/ui/text-link.tsx`, `lib/use-inert-background.ts`);
  components are PascalCase named exports. Default exports only where Next.js requires
  them (pages, layouts, route files, metadata files).
- Every exported symbol: JSDoc — purpose, params, a11y notes where relevant.
- Comments explain *why*, never *what*.
- Zero console errors/warnings in dev and prod. Zero ESLint suppressions without a reason comment.

## 3. Component contract (every component in `components/ui` and `components/mdx`)

Header JSDoc must document: **Purpose · Props · Variants · Accessibility · Performance
notes**. Plus: usage example added to `/dev/components`, and a test if it contains logic
(conditional rendering, keyboard handling, formatting). The primitives and their APIs
are listed in design-system.md §5.

## 4. Accessibility — WCAG 2.2 AA (contractual)

- Semantic landmarks (`header/nav/main/footer`), one `h1` per page, logical heading order.
- Full keyboard operability incl. SystemDiagram and assistant panel; visible focus everywhere;
  skip-to-content link.
- `prefers-reduced-motion` respected globally (see design-system.md §6).
- Images: meaningful `alt`; diagrams get text alternatives (the narration list).
- Forms/controls: labeled, error text linked via `aria-describedby`.
- Automated gate: `npm run test:a11y` (Playwright + axe-core: the WCAG 2.0–2.2 A/AA
  rules, plus the best-practice rules Lighthouse scores, such as `heading-order`,
  `landmark-unique`, and `region`, which keeps all content inside landmarks) on every
  route in its list — `/contact`, `/skills` and both flagship case studies included — at
  1280/768/360px, and at 360px both flagships again with every phone disclosure
  (`ShowMore`) open; plus the open Work and About menus, the open mobile menu (the modal
  sheet), the assistant panel opened from the header and from a case study's "Ask AI
  about …" and an essay's ask button (each on its page's starters), a mocked assistant
  conversation (the cited page, Copy answer, next steps, follow-ups, "Jump to latest"),
  the reduced-motion contract, and the keyboard contracts (the mobile menu's focus
  containment and Escape, the assistant's focus trap) → **zero violations** (80 axe
  audits on 2026-11-17). Each pass blocks `/api/chat` and fails if a page load or an
  overlay sent anything. The site is light-only (ADR-018), so there is one pass, not
  one per theme; the dark pages and plates are covered inside it.
  Manual check for UI changes: a keyboard-only pass and a screen-reader spot check.

## 5. Performance budgets

Measured by `npm run test:lighthouse` (`scripts/lighthouse-budget.mjs`): the Lighthouse
CLI, mobile form factor with simulated throttling, the median of three runs per route
(`LIGHTHOUSE_RUNS`), against a local standalone production server. Routes: `/`,
`/work/dbwhisper`, and `/writing/a-validator-is-not-a-better-prompt`. The flagship case
studies, the longest pages, are not among them. See ADR-009.

A budget is the standard the site is held to. The last column says what CI enforces
today. Where the code misses a budget, the gap is a defect to fix, not a reason to move
the budget; changing a budget needs an ADR.

| Metric | Budget | Enforced today |
|---|---|---|
| Lighthouse | ≥ 95 Performance · 100 Accessibility · 100 Best Practices · 100 SEO | fails the gate |
| LCP | ≤ 2.5 s (raised from 2.0 s in 2026; the reason is recorded in ADR-018, "Carried forward") | fails the gate. CI, 2026-11-17 (f273f65): home 2657 ms, case study 2734 ms, writing 2272 ms, so home and the case study miss it; see "What the LCP budget measures" below |
| CLS | < 0.05 | fails the gate |
| TBT (lab) | < 150 ms | fails the gate |
| Route JS (gzip, first load) | ≤ 120 KB home · ≤ 90 KB content pages | printed, not failing; over budget. CI, 2026-11-16 (before the redesign): home 164 KB, case study 164 KB, writing 157 KB. The redesign, measured the same way on 2026-11-17: home 160 KB, case study (`/work/dbwhisper`, which now holds the boundary inspector) 174 KB, writing 159 KB. With the flagship case studies, on a production build the same day: gzip bodies home 155.8 KB, every case study, flagships included, 166.0 KB, writing 149.6 KB; with headers, as CI's Lighthouse counts them, 164.8, 175.9 and 158.6 KB. CI, 2026-11-17 evening (f273f65, after the flagship routes and the chunk merge): home 164 KB in 9 scripts, case study 172 KB in 9, writing 158 KB in 9 |
| Assistant panel chunk | lazy: fetched when a pointer or focus first reaches a launcher, or on open; ≤ 60 KB | review. 10.8 KB gzip in two chunks on a production build (2026-11-17, after the assistant upgrade; 7 KB before it), fetched on the first pointer over a launcher, with no extra stylesheet. esbuild's upper bound over everything the panel imports is 12.6 KB of JS (AI_ASSISTANT.md §9) |
| INP | < 200 ms | field metric; no lab gate and no field data yet |
| Fonts | ≤ 130 KB woff2 in total, self-hosted by `next/font` | review: 51.2 KB in two files (2026-11-18). Geist, 28.6 KB, is preloaded (the LCP text is set in it); Geist Mono, 22.6 KB, is fetched after the first contentful paint (below, "What the LCP budget measures") |
| Images | AVIF/WebP through `next/image`, explicit dimensions, lazy below the fold | review |

The route-JS gate prints rather than fails because framework chunks shared by every
route make up most of the transfer, so a hard limit would fail on that floor rather than
on a regression (see the comment in `scripts/lighthouse-budget.mjs`). On the home page,
measured before the flagship work, the framework was about 132 KB of the 150 KB of gzip
bodies, and the site's own code was the shared chrome chunk (9.5 KB), the home islands
(3.3 KB) and the error boundaries (4.5 KB). Whether the budget is reachable on this
framework is open; meeting it or
changing it through an ADR are the two ways to close the gap.

Measure route JS as a browser fetches it, which is what CI's Lighthouse number is: every
script requested while the page loads and settles, gzip bodies plus headers. Two traps:

- The prerendered HTML also lists Next's legacy-polyfill chunk as a `noModule` script
  (about 39 KB gzip). No browser that runs modules downloads it, so summing every
  script tag in the HTML overstates first-load JS by that much (it once read the
  redesigned home as 193 KB).
- A local proxy or antivirus can strip compression on the way to the browser, so a
  local Lighthouse run may report uncompressed bytes (about 500 KB). Re-fetch each
  script with `Accept-Encoding: gzip` to read the real transfer, or rely on CI.

### What the LCP budget measures

Lighthouse simulates LCP (Lantern): it replays every request that **finished before the
observed LCP** of an unthrottled load over a modelled slow-4G link (150 ms RTT,
1.6 Mbps, six HTTP/1.1 connections, CPU ×4). On this site that is almost the whole page,
and four facts follow, each checked against Lantern's source and CI's own traces
(the gate prints the observed timeline under each route, as advice):

- **The JavaScript counts.** CI's first paint lands at 130–210 ms, after every script
  has downloaded. A script is left out only when its own evaluation (10 ms or more)
  starts after that paint. Turbopack's chunks register modules in 0–3 ms, which Lantern
  ignores, so they always count; only the chunk evaluated last, the one that runs the
  hydration bootstrap, can be left out (usually react-dom, 72 KB).
- **That exclusion is a race.** The bootstrap starts 1–33 ms after CI's paint. If it
  starts first, about 72 KB more is charged and LCP rises by roughly 500 ms: the
  writing page measured 2337, 2830 and 2349 ms on three commits that did not touch it.
- **Requests cost as much as bytes.** Each request waits for one of six connections and
  a round trip, and scripts queue last (Lantern places a Low-priority request one second
  behind the rest), so the last framework chunk to finish is the end of the graph.
  `next.config.ts` therefore keeps Next's default CSS merging (`cssChunking: true`: two
  or three stylesheets a page) and merges each page's small JavaScript chunks
  (`turbopackChunking.minChunkSize`, 200 KB). Graph chunking (`"graph"`) sends a page
  closer to only its own CSS, but in five to nine files: on the case study 9 files and
  32.8 KB against 2 files and 34.5 KB, and the seven extra requests cost more than the
  bytes they save. It also gave home and writing 2–14 KB less CSS, which they can
  afford to carry (production builds, 2026-11-18).
- **A font counts when it finishes before the paint.** Geist Mono did on every page,
  though no first screen shows mono text: the home hero's hidden prompt preview and
  every mono label below the fold ask for the face during the first layout. Lantern
  charged its 23 KB to LCP. The boot script in `app/layout.tsx` now fetches it after
  the first contentful paint, and `mono-pending` (`styles/tokens.css`) sets mono text in
  the system's monospace face until then: about −160 ms on the home page and −90 ms on
  the case study, priced locally in CI's regime (2026-11-18).
- **The document counts in steps.** Its bytes arrive in TCP slow start, 14.6 KB in the
  first round trip and then 29.2 KB a round trip, before any other request starts, so
  a document over 43.8 KB (headers included) costs a whole extra 150 ms round trip.
  `/work/dbwhisper` is 50.7 KB.

Measured locally on the case study (CI's regime: react-dom left out), before the two
changes above: moving the full write-up off the page would save about 150 ms (document
−40%), fewer stylesheets 20–230 ms depending on what else shares the connections, and
keeping Geist Mono out of the first paint 90–160 ms. The last two are now done without
touching the design; the write-up stays where it is. On the home page, the showcase's two
CareLTC captures near y = 3300 px load at first layout (Chrome's lazy-loading distance
reaches them) and cost about 80 ms. A local run on Windows cannot reproduce CI's race:
there the first paint waits 200–400 ms for the software GPU to compile some 40 shader
programs, so every script counts. To price a change on CI's terms, record a run
(Lighthouse `-G`), set each response's size in the DevTools log to what the server
sends compressed, leave the bootstrap chunk's request out, and audit it (`-A`).

Heavy things are lazy by rule: the assistant panel, diagrams below the fold, demo videos
(no video bytes until played), and below-fold images. Static generation for all content
routes; no client data fetching for content.

Prefetch is opt-in, never by viewport: every `next/link` sets `prefetch={false}`
(`TextLink` included), and only the primary nav prefetches, on hover or focus
(`components/layout/nav-link.tsx`). A viewport prefetch downloads each linked route
and preloads its stylesheet; on /about that was 13 background requests and a Chrome
warning about the unused CSS. ESLint fails a `<Link>` without a `prefetch` prop
(`eslint.config.mjs`), and the smoke test fails on any console warning.

## 6. Testing (right-sized, honest)

- **Unit (requirement):** every exported function in `lib/`, logic-bearing components,
  and content schema validation have tests. The runner is Node's `node:test`: `npm test`
  runs `test/**/*.test.mts` with `test/alias-loader.mjs` resolving the `@/` alias and
  extensionless TS imports (a file before a same-named directory, as the bundler
  resolves them); Node 24 strips the types natively.
  Current coverage (2026-11-17): 240 tests in 26 files covering content law (projects,
  metric methods, links, and recordings served only while a project lists them), feeds,
  formatting, navigation, reading time, env parsing
  (`GEMINI_MODEL`), the content-slug guard (`lib/content-slug.ts`); the flagship case
  studies — the approved usage figures and credit word for word, no "daily" and no
  superseded figure, every capture, poster, recording and caption track at its declared
  size, and caption cues that match the scene lists (`flagship-content.test.mts`); the
  "Used in" evidence on `/skills` and `/uses` (`stack-evidence.test.mts`); the assistant
  (corpus, retrieval, citations, actions and follow-ups, the injection guard, answer
  formatting, the chat contract and handler, the open requests and the slow cue, the
  rate limiter, and the golden set offline); the published evidence: no retired or
  retyped evaluation figure, the superseded job title, and the role's sentence form
  (`evidence.test.mts`); `public/llms.txt` completeness, with the static pages read
  from `app/`, the flagships' usage wording and the notice period
  (`llms-txt.test.mts`); the résumé PDF's currency, one A4 page, its type floors,
  metadata, links and approved facts, and the AWS line against the flagship stacks
  (`resume-pdf.test.mts`); the phone number whole in the PDF only, never in a source,
  script, test, doc or public text file (`resume-phone.test.mts`); search metadata —
  `pageMetadata`, note descriptions, and the title and description limits for every
  note, essay and case study (`seo.test.mts`); and the icons — not the create-next-app
  favicon, drawn in the current palette, and rendered from `app/icon.svg`
  (`icons.test.mts`). Gap against the requirement: some
  exported `lib/` functions have no direct test yet, notably the MDX collection loader
  beyond its slug guard and excerpt (`lib/mdx-collection.ts`), which compiles React and
  so cannot run under the plain test runner.
- **Assistant grounding:** `test/retrieval.test.mts` checks the corpus and per-question
  relevance against 19 detailed and 43 short questions (`test/fixtures/test-questions.ts`),
  plus misspellings, aliases, off-topic questions, follow-ups, the page prior, and every
  starter and follow-up; `test/assistant-golden.test.mts` is the offline gate, the
  67-item golden set (`test/fixtures/assistant-golden.ts`) through the handler with a
  fake model and again without a key; `test/guard.test.mts` checks the injection screen
  against attack and legitimate question lists; `test/chat-handler.test.mts` drives the
  route's handler with real requests, fake model streams and a fake router — all without
  any LLM quota. The live evaluation, `npm run eval:assistant`, spends quota and never
  runs in CI. See AI_ASSISTANT.md §7–§8.
- **Browser gates (Playwright scripts in `scripts/`):** accessibility (`test:a11y`),
  interaction contracts (`test:interaction`), motion (`test:motion`), accent drift
  (`test:hue`), print (`test:print`), screenshots and overflow (`test:screens`), links
  (`test:links`), deployment smoke with zero console errors or warnings
  (`test:smoke`), metadata on every sitemap URL (`test:metadata`, no browser), and
  Lighthouse (`test:lighthouse`).
  What ADR-018 changed in them: every gate runs the light site once (no `THEME=dark`
  pass); `test:hue` allows the neutrals, the violet accent, the plate cyan and the
  status green, amber and red; the boundary-inspector and walkthrough checks run on
  `/work/dbwhisper`, where the inspector now lives, instead of `/`; `test:motion`
  checks the arrow-swap caret, the menus, the tab pill and panel crossfade, the
  marquee's hover pause, the copy chip, the hover moments on `/work`, a case study and
  a flagship's architecture sketch, and each reduced-motion alternative, and fails on
  an animation name that resolves to no keyframe (bare or through a `--kf-*` name) or
  on any loop but an ambient one running at rest on any route; `test:a11y` adds axe's
  `region`; the link and smoke gates include `/contact`; and the dialog and trigger
  names come from `components/assistant/copy.ts` (AI_ASSISTANT.md §5).
  What the flagship case studies changed (ADR-019): every route list names
  `/work/bench-discovery` and `/work/careltc` where it named the field reports; the
  link gate requires both to be linked from a page and reached, and crawls the two
  retired field-report URLs, which must land (the metadata gate checks their 308s); the
  smoke gate expects each product's name; the motion gate's `/work` hover moment is a
  `#flagship` card; the metadata gate
  treats any case study `/work` links to that the sitemap omits as a draft that must
  stay unindexed (none today); and the interaction gate holds the tour's ARIA tabs,
  every recording (`preload="none"`, no autoplay, captions, a poster overlay, no media
  bytes while the page loads and scrolls) and the "Real app · dummy data" label on
  every capture, unclipped and the first thing painted at its centre. The boundary
  audit's anchor must clear the work sub-nav. The modal mobile menu (ADR-018, amended)
  is held by the a11y and interaction gates: one dialog named "Site menu", the page
  behind inert and not scrolling (it joins the assistant in the inert-boundary loop),
  focus kept inside, Escape and a tap on the scrim closing it with focus back on its
  button. The assistant contracts mock `/api/chat` in the current wire shape (the
  request `{ messages, page }`; citations, then actions and follow-ups), and a tampered
  stream proves a foreign page, action or follow-up never renders; the openers on a case
  study, an essay, `/` and `/contact` open the panel on their starters, send nothing
  and get focus back on close; and the copy checks assert what was copied ("Copy code"
  copies the excerpt verbatim, "Copy link" the full address), not only that the
  clipboard changed. `test:links` also holds the arrow law (design-system.md §11.4) on
  every server-rendered link.
  Every gate runs in Chromium only (CI installs no other engine); Firefox and
  Safari are not exercised by any automated check.
- **Copy gate (`test:copy`, `scripts/copy-audit.mjs`):** reads the prerendered HTML in
  `.next/server/app` after a build — no browser, no server — and fails when an inline
  element touches the next word ("structural</strong>— the"). JSX drops whitespace
  that contains a line break, so only the built output proves the text reads
  correctly; the fix is an explicit `{" "}`. An empty inline element (a CSS dot) and a
  text-only one marked `aria-hidden="true"` (a heading's `#` anchor, a prompt glyph)
  carry no words, so they are dropped first and their neighbours checked against each
  other.
- Not chasing coverage %; chasing "every behavior that can silently break has a test."

## 7. Git workflow

- `main` is the deployable branch; work lands through pull requests from short-lived
  branches. No long-lived develop branch (solo project).
- Conventional Commits. PR description: what/why + screenshots for visual changes +
  DoD checklist pasted and ticked.
- CI (`.github/workflows/ci.yml`) on every pull request and every push to `main`:
  type-check → lint → test → build → copy gate → browser gates (a11y, interaction,
  motion, accent drift, print, internal links, metadata, smoke). Lighthouse budgets run on pushes
  to `main` and on pull requests that target `main`. Red CI = no merge, no exceptions.

## 8. Definition of Ready (before coding any story)

Requirements + acceptance criteria written · responsive behavior defined · a11y notes
present · all states listed (default/hover/focus/active/loading/empty/error) · content
exists in `content/` (placeholder copy is a spec violation, not a stopgap).

## 9. Definition of Done (per story — paste into PR)

```
[ ] Acceptance criteria met
[ ] Responsive 360 / 768 / 1280
[ ] Keyboard + focus pass; axe clean on affected routes
[ ] prefers-reduced-motion respected
[ ] Typed; zero TS errors; zero ESLint errors
[ ] Tests added/updated and passing
[ ] Published figures re-checked against the project's README and claim audit at the
    cited commit; `npm run build:resume` run if résumé data or a figure changed
[ ] Disclosure scan clean, with its positive control (ADR-019): the local denylist
    over the changed sources, docs and media text, and over the build before a release
[ ] No hardcoded copy/colors/spacing (tokens + content only)
[ ] JSDoc + /dev/components entry (if component)
[ ] Budgets respected (check bundle output for route)
[ ] Zero console errors
[ ] Docs updated if behavior/structure changed
```

## 10. Dependency policy

Every new dependency needs: an ADR note (or falls under an existing ADR), a size check
(bundlephobia), maintenance check (commits in last 6 months), and a one-line justification
in the PR. Prefer platform → stdlib → tiny lib → framework, in that order.
GitHub Actions versions are kept current by Dependabot (`.github/dependabot.yml`, one
grouped pull request a month); npm dependencies are upgraded deliberately, not by bot.

## 11. Observability & analytics

Privacy-first analytics: `@vercel/analytics`, rendered only on Vercel deployments
(`VERCEL=1`); no cookies, no consent banner. Custom events, sent through
`lib/analytics.ts`: `case_study_read_depth` (25/50/75/100, from the reading outline of
the four public case studies; the flagship case studies have no outline and send none)
and `resume_downloaded`. Error tracking: none beyond the platform's logs. The assistant
route logs one JSON line per answered turn — mode, note, how the passages were found and
their content ids, the routing call's result and tokens, the actions offered, whether a
page was sent, timings, the finish or failure reason, whether a hedged call ran and won,
and token counts; never the question, the answer, the key or the client address
(AI_ASSISTANT.md §6) — warns with the model id and HTTP status when Gemini rejects a
request, and warns when a content collection is unreadable. The rate limiter keeps
salted address hashes, timestamps and daily counters in memory only.
