# CONTENT_MODEL.md — Schemas & templates

Site copy lives in `content/` and `config/site.ts`. Projects and evaluations are
typed TypeScript modules parsed with Zod at module load; writing, notes and `/now`
frontmatter is validated with Zod when it is loaded. Either way, invalid
content throws and the build fails, and the types are inferred from the schemas in
`content/schema.ts` — never hand-written. The résumé, the flagship case studies
(`content/flagship/`) and the page-copy modules (`site.ts`, `article.ts`,
`content/pages/*.ts`) are typed objects that TypeScript checks but no schema
validates.

---

## 1. Projects and case studies (the heart of the site)

Six case studies: the two flagship products (§1.5) and four public projects (§1.1–§1.3).

### 1.1 Project record — `content/projects.ts` (`ProjectSchema`)

```ts
{
  slug: string,
  title: string,                    // system name, not a marketing name
  summary: string,                  // ≤ 160 chars; the case-study lede and the page's search description
  status: "deployed-demo" | "active-development" | "experiment" | "archived",
  role: string,                     // "Designed, built, and maintained (solo)"
  timeline: string,                 // "2025 – present"
  featured: boolean,                // exactly ONE is featured (test/content.test.mts); no page reads it today
  order: number,
  systems: string[],                // ≥ 1
  metrics: Array<{
    label: string,
    value: string,
    before?: string,
    direction?: "up-good" | "down-good",
    method: string                  // REQUIRED, non-empty: how it was measured, over what sample/period
  }>,
  links: { live?: url, repo?: url },
  diagram?: string,                 // id of components/diagrams/data/<id>.ts
  recording?: {                     // the product recording the case study plays (§1.3)
    alt: string,                    // what the recording SHOWS
    caption: string,                // the captured surface, and any on-screen statement the page does not stand behind
    width: number, height: number
  },
  card: {                           // the preview shared by the homepage and /work
    definition: string,             // ≤ 90 chars; what the product is
    category: string,               // the technical family, not a tag cloud
    decision: { title: string, showResult: boolean },
    shot: { src: string, width: number, height: number },  // a real capture in /public
    alt: string,                    // what the capture SHOWS
    caption: string                 // the captured surface; never an implied live result
  },
  changelog: Array<{ date: string, summary: string }>  // real, dated milestones, newest first
}
```

There are four projects (asserted by `test/content.test.mts`): DBWhisper (featured),
TradePulse, CrownWager, and LLM Studio.

`status` says what a project is, not whether its host is awake. `deployed-demo`
(label "Deployed demo", `PROJECT_STATUS_LABEL` in `content/article.ts`) is a public
deployment on free-tier hosting that can sleep or be paused, so it claims no uptime
and no operating users; nothing on the site calls a project "live". A demo that is
down drops `links.live` — which removes its card link, the case-study "Open demo"
button and caption link, its résumé and PDF link, and its assistant passage — and
keeps its source, and its recording if it has one. Restore `links.live` when the host
runs again.

### 1.2 Case-study body — `components/case-studies/<slug>.tsx`

Each project's page body is a server component that renders evidence components
directly (`SystemDiagram`, `DecisionLog`, `FailureLog`, and `MetricsTable` in every
body; `CodeBlock` or `Callout` where needed) and exports its section list for the
reading outline. The section order, with these headings:

```
Context                    what problem, who feels it, what it costs
Constraints                the real ones; they make the later decisions legible
System architecture        <SystemDiagram> + one narration paragraph per component
Data flow                  one representative request traced end to end
Key decisions              <DecisionLog>: 3–6 entries — choice, rejected alternatives, reason, accepted cost
What failed                <FailureLog>: v1 → v2 with cause and fix; at least one genuine failure
Performance & cost         every number with its method; if it can't be shared, say so
Operations                 how it runs, how failures are handled
What I'd do differently    2–4 honest items, not humblebrags
Evidence                   repo, recordings, related writing, sample outputs
```

The DBWhisper body adds **Request walkthrough** after Data flow
(`/work/dbwhisper#request-walkthrough`). A project without an authored body falls back
to `components/case-studies/generic.tsx` (Systems + a plain "write-up in progress"
note). There is deliberately **no "Tech stack" section**; the stack surfaces inside
Architecture and Decisions.

### 1.3 Supporting files

- `components/diagrams/data/<slug>.ts` — typed `DiagramSpec` nodes and edges.
- `content/projects/<slug>.mdx` — a long-form summary (sections: Executive Summary,
  Problem, Architecture, Key Decisions & Trade-offs, Metrics / Results, Lessons). It is
  **not rendered on the site**; `lib/ai/corpus.ts` chunks it by `##` heading into the
  assistant's corpus, so keep it consistent with the case study. Its frontmatter is not
  schema-validated.
- `public/demos/<slug>.webm`, `.vtt`, and `.webp` — the product recording, its
  captions, and its poster (the poster is also the card capture). A project lists its
  recording in `recording` (§1.1), and `app/work/[slug]/page.tsx` plays it above the
  metrics. `test/content.test.mts` fails when a listed recording is missing one of its
  files, or when a video or captions file is served for a project that lists none, so
  withdrawing a recording takes it off the site. DBWhisper has no recording since
  2026-11-16: its product-site capture showed the withdrawn golden-set figures and the
  scale and uptime claims its claim audit deleted (§4.4 at `bca0635`), which a caption
  cannot take off the screen. Its `.webp` stays as the card capture. A new recording
  is made from the current v2 site and passes the release check in §4.
- `content/dbwhisper-walkthrough.ts` and `content/dbwhisper-boundary.ts` — curated,
  labelled sample data for the walkthrough and the homepage inspector; never measured
  results. The walkthrough's Evaluate stage is the exception: its counts are read from
  the eval registry (`DBWHISPER_EVIDENCE`), never typed.

### 1.4 Compliance rule (healthcare content)

Healthcare work, such as the Sevina role, is described by aggregate metrics and
methodology only. No PHI, no resident-level data, no facility-identifiable claims
figures, no payer contract terms. All screenshots reproduced with synthetic data. When
in doubt: describe the mechanism, omit the number.

### 1.5 Flagship case studies — `content/flagship/` (`Flagship`)

Bench Discovery and CareLTC, the two products built at Sevina Technologies that the
company approved for publication by name (17 Nov 2026), rendered at
`/work/bench-discovery` and `/work/careltc` by the flagship template
(`components/flagship/`). The old anonymous report URLs `/work/field/records-triage`
and `/work/field/nfc-room-rounds` redirect to them (308). The type is
`content/flagship/types.ts`; the registry `flagships` (`content/flagship/index.ts`)
holds them in the site's order of work (the Work menu, the sub-nav, `/work`, the home
page, the sitemap); the template's labels and section anchors are
`content/flagship/labels.ts`; what both share — the employer, the approved usage
figures (`USAGE`), the agent-direction line, the private-repository notice, the
"Real app · dummy data" label, the walkthrough offer and the AWS service names — is
`content/flagship/shared.ts`. `flagshipSections()` (`content/flagship/sections.ts`)
gives a case study as plain-text sections in page order, each with its anchor
(`/work/<slug>#<anchor>`), for a reader that is not the page; today only
`test/flagship-content.test.mts` reads it, since the assistant builds finer passages
from the same records (AI_ASSISTANT.md §2). Why each rule below holds is recorded in
[ADR-019](decisions/ADR-019-named-flagship-case-studies.md).

A `Flagship` record holds: the name, the product statement (`headline`, the h1), the
`summary` (the lead and search description, 50–160 characters), a one-line
`definition`, the `domain`, the date it was last checked against the product
(`updated`, the sitemap's date), `credit`, `figures`, `problem` and its users,
`constraints`, what was `built`, the primary `sketch` and `moreSketches`, the `trace`
("How it works"), the `boundary` table, `deployment`, `incidents`, `decisions`,
`verification` (suites, checks, "Not measured"), `outcome` ("Proves" / "Doesn't
show"), `highlights` (each with its decorative `HighlightArt`), `excerpts`, the `hero`
captures, the tour's `gallery` tabs, `recordings` (with their `scenes`), the `stack`,
and the `card` line for `/` and `/work`. The section anchors are
`FLAGSHIP_SECTION_IDS`: `tour`, `problem`, `recordings`, `how-it-works`,
`highlights`, `architecture`, `code`, `constraints`, `what-broke`, `decisions`,
`verification`, `deployment`, `outcome`, `walkthrough`.

- **Disclosure.** Published: the names Sevina Technologies, Bench Discovery and
  CareLTC; the usage figures in the owner's exact wording; screenshots and recordings
  of the real apps on dummy data, each frame labelled "Real app · dummy data";
  curated, sanitised code excerpts with generic file labels; the AWS services the
  products run on (names only). Never published: production repositories, URLs or
  hostnames, account or resource identifiers, regions, real client or facility names,
  keys or secrets, and security incidents. `rg -i -F -f .local/showcase/denylist.txt`
  over the published folders returns nothing.
- **Credit.** `credit` holds `role` only: the owner's own sentence, in the present
  tense, and the only attribution the page makes — Bench Discovery: "I designed, built
  and maintain both the desktop app and the web platform."; CareLTC: "I lead CareLTC
  and did the main engineering work, and I still maintain it and ship new features."
  Work is never attributed by git history and no colleague is named or described, on
  the page, in an excerpt or in the assistant's index; an excerpt has no credit field.
  The hero shows the credit and the agent-direction line (`AGENT_DIRECTION`) as two
  labelled lines, "My role" and "How I build" (`FLAGSHIP_LABELS.credit`).
- **Figures.** The hero's `figures` row holds one usage figure (`source:
  "approved-usage"`), which is `USAGE[slug]` word for word, and test counts (`source:
  "verification"`) whose method is in the Verification section, beside an explicit
  "Not measured" list. The status is "In use" (`STATUS_PILL["in-use"]`), never
  "daily". `test/flagship-content.test.mts` fails on a usage figure that is not the
  approved one, on a credit that is not the approved sentence, on a superseded figure,
  on "daily", and on a missing or mis-sized capture.
- **Code excerpts.** `excerpts`, five per product: a title, a two-sentence `story`
  (the problem, then what the code does about it), a generic `file` label that is never
  a private path, a language (`csharp`, `python` or `ts`) and the curated, sanitised
  `code`, highlighted by Shiki on the server. The assistant indexes the title and the
  story, never the code.
- **Media.** Captures and posters under `public/showcase/<slug>/` (WebP, ≤ 300 KB
  each); recordings as WebM (≤ 7.5 MB) with a poster and a WebVTT track whose cues
  match the page's scene list, its text alternative. The test checks that every file
  exists at the pixel size its record declares and that every cue matches its scene;
  the byte budgets are held by review (ADR-019).
- **Stack.** `stack.groups` (technology by layer) and `stack.aws` (typed `AwsService`
  names, spelled once in `AWS`) feed the Deployment section, the assistant's index and
  the "Used in" evidence on `/skills` and `/uses` (§5). The cards and the `/work`
  stack band show the curated one-line `card.tech`. The résumé's AWS line
  (`RESUME_AWS`, §4) may name only services in a `stack.aws`.

---

## 2. Writing — `content/writing/*.mdx` (`WritingSchema`)

```ts
{ title, summary (≤ 160), date, updated?,
  category: "essay" | "guide" | "note",
  topics: string[], draft: boolean }          // slug = file name; must match /^[a-z0-9-]+$/
```

The summary is the article's lede and its search, social-card, structured-data and
feed description, so it is held to the snippet limit (`constants/seo.ts`); the schema
fails the build past 160 characters.

- **essay** — trade-offs and judgment.
- **guide** — implementation, reproducible, code-heavy.
- **note** — a short piece inside the writing archive.

Loaded by `lib/writing.ts` through `lib/mdx-collection.ts`. Essays are best mined from
a case study's Key decisions.

---

## 3. Notes and /now

- **Notes — `content/notes/*.mdx` (`NoteSchema`):** `{ title, summary? (≤ 160), date,
  tags (≥ 1), source?: url, draft }`. Short, dated, tag-indexed; `/notes` filters by tag.
  Loaded by `lib/notes.ts`. As for writing, the slug is the file name and must match
  `/^[a-z0-9-]+$/` (`lib/content-slug.ts`), or the build fails. A note is described —
  in search, on its social card, in its structured data and in `/rss.xml` — by its
  `summary` if it has one, otherwise by its opening sentences cut at a sentence
  boundary (`noteDescription`); never by its tags. A title past about 46 characters
  is shown without the " · Mubin Attar" suffix rather than cut.
- **Now — `content/now.mdx` (`NowSchema`):** `{ updated (required), lede, exploring:
  [{ title, body }] }`. `updated` is required so "Last updated" can never go silently
  stale. `/now` renders `exploring` as its "Exploring" entry, after "Building now",
  and the assistant indexes the frontmatter with the body. Loaded by `lib/now.ts`.

Writing and notes share the draft rule: `draft: true` removes an entry from indexes,
feeds, the sitemap, and generated routes in production, and keeps it previewable in
`next dev`.

---

## 4. Structured records

- **Evaluations — `content/evals.ts` (`EvalSchema`):** `{ system, benchmark, metric,
  result, score?: { passed, scored, sampled? }, status: "in-progress" | "complete" |
  "planned" | "retired", date?, note?, link?, retired?: { date, reason, link } }`.
  - An unfinished run renders muted, never as a result.
  - **A figure is written down once.** Each run's recorded values are constants in
    `content/evals.ts`, copied from the project's own records at the commit the row
    links; every string a page shows (`101/139`, `72.7%`, `65.2% ± 0.8%`) is
    formatted from them there. A scored row's `result` must contain its
    `passed/scored` counts (schema-checked).
  - Surfaces read figures through `DBWHISPER_EVIDENCE` (the policy-corpus and
    Spider results with their scope labels — the homepage evidence line, the
    walkthrough, the résumé), `CROWNWAGER_EVIDENCE` (cross-validation and hold-out
    figures — the project card, case study, diagram, résumé), or
    `requireCompleteEval()`; `requireEval()` and these throw at module load if a row
    they cite is renamed, removed, or no longer complete. `evalAnchor()` builds
    `/evals` anchors.
  - **A result that does not hold is retired, not deleted.** The row keeps its
    `status: "retired"`, the reason, and a fixed-commit link to the audit that
    withdrew it; it renders muted on `/evals` and carries no `score` and no digit in
    its `result` (schema-checked). Its figures come down from every other surface.
    DBWhisper's golden-query run (18/22 exact, 4/4 refused) was retired on
    2026-11-16 after DBWhisper's own claim audit (§4.4 at commit `bca0635`) withdrew
    it.
  - **A deterministic policy test is labelled as one** wherever it appears — "not
    model accuracy" — because it measures a decision function on written-down
    cases, with no model and no database.
  - Before (re)publishing a project's figure, re-read that project's README and
    claim audit at the commit the row will cite, and link that commit — not a
    branch. A recording gets the same release check: before it is published, every
    frame and every caption cue is checked against the project's claim audit, and the
    captions are timed to the cut. A recording that shows a withdrawn figure or claim
    is removed, not captioned.
  - A row's `date` is the date of the run that produced its figures (the commit that
    recorded them when the run has no other record), never the date a page was edited.
  - `test/evidence.test.mts` fails when any surface quotes a retired figure or a
    deleted scale or availability claim, when code retypes a registry figure, or when static text
    (MDX, captions, `public/llms.txt`) quotes one that disagrees with the registry.
- **Résumé — `content/resume.ts`:** the single source for `/resume`, `/skills`, the
  assistant, and `public/Mubin_Attar_Resume.pdf`. Each featured project names its
  `slug`; the project record supplies the name, case-study path, and demo and source
  links, so a demo that goes down loses its résumé link in the same change. Each
  metric line is read from the registry with its scope and date and carries its own
  method link. Regenerate the PDF with `npm run build:resume`
  (`scripts/build-resume-pdf.mts`, printing the document that
  `scripts/resume-document.mts` renders); it records the document's and the PDF's
  hashes in `scripts/resume-pdf.lock.json`, and `test/resume-pdf.test.mts` fails
  until a change to the résumé, the site config, the flagship records or the registry
  is followed by a regeneration. The PDF links the site, both flagship case studies,
  every featured project's case study, method and source, and only the demos that are
  up. Site, PDF, and LinkedIn must carry identical facts; the phone number is the one
  deliberate difference.
  - **One A4 page, read by screening software first.** The build fails, writing
    nothing, unless the document prints to exactly one A4 page, and it warns about a
    bullet longer than two lines and a one-word last line. The page fits by cutting
    words, never by shrinking type: the test holds the floors (body 10 pt, small text
    9 pt, margins of at least 12 mm top and bottom and 13 mm at the sides). One column
    of real text under the five standard headings — Summary, Experience, Projects,
    Skills, Education (`resume.labels`) — as plain words, with the PDF's title, author,
    subject and keywords set, every keyword a term the résumé itself uses.
  - **The flagships lead.** The summary and the first experience bullets name Bench
    Discovery and CareLTC with their `USAGE` figures, each linked to its case study in
    the PDF; the header carries the notice period (`STATUS.noticePeriod`).
  - **Projects.** Three featured projects, DBWhisper, TradePulse and CrownWager, each
    with a registry figure; LLM Studio keeps its case study and source on `/work` but
    is not on the résumé. DBWhisper's line quotes the policy-corpus result only: its
    Spider result needs more scope than a résumé line holds, so `/evals` keeps it in
    full. A project may carry a `detail` line, how it is built, stated only where its
    public repository shows it at the audited commit; `/resume` and the PDF both show
    it.
  - **Skills.** Six groups. The "Cloud (AWS)" line is `RESUME_AWS`: nine labels
    standing for ten of the seventeen AWS services the flagship products run on, each
    label naming services in the shared `AWS` register, and the test fails if any of
    them is missing from a flagship's `stack.aws`.
  - **The phone number appears whole only in the PDF** (owner, 17 Nov 2026), never on
    a page, in the JSON-LD, in `public/llms.txt` or in a doc. `scripts/resume-document.mts`
    holds it in parts (`PHONE_PARTS`), and `test/resume-phone.test.mts` fails if any
    source, script, test, doc or public text file in the repository carries it,
    however its digits are spaced. Never write it into a doc.

  The download link emits the `resume_downloaded` analytics event.

---

## 5. Site and page copy

- `config/site.ts` — name, role (`role` for labels and titles, `roleInSentence`
  inside a sentence — never `role.toLowerCase()`, which lowercases "AI"), the site
  description (`SITE.description`, ≤ 160: the homepage's search description and the
  default), email, location, socials, integrations (the booking link,
  `INTEGRATIONS.calUrl`), the availability line and the notice period (`STATUS`, one
  value for /hire, /contact, the PDF, llms.txt and the assistant), footer copy, the
  assistant's chrome labels (`ASK_AI`) and the status-pill vocabulary (`STATUS_PILL`).
- `config/nav.ts` — the header (the Work and About menus, the plain links, the
  Contact and Hire me pills), the mobile menu, the footer map, and `WORK_ITEMS`, the
  work sub-nav's order (the two flagship case studies from `content/flagship`, then
  the four public systems from the registry). The Work menu shows the same two groups,
  flagships first.
- `content/pages/<page>.ts` — **one module per page for the copy that page alone
  shows**: `home`, `about`, `hire`, `contact`, `work` (the index and the case-study
  frame), `writing` (the index and the article frame), `evals`, `resume`, `now`,
  `trust` and `uses`. A page's sections import their words from here, never from a
  `copy.ts` beside the components. Figures are never typed into these files: they
  import from `content/evals.ts` (`DBWHISPER_EVIDENCE`, `CROWNWAGER_EVIDENCE`,
  `requireEval()`) and addresses from `config/site.ts`.
- `content/site.ts` — copy that more than one route reads: the index-page and 404
  frames (`pages`), the principles (`home.principles`: /about and the assistant),
  `/about`'s social-card title (`about`), `/now`'s frame (`nowPage`), `/uses`'s stack
  (`uses`) and `/trust`'s content (`trust`).
- `content/article.ts` — article header and footer labels shared by case studies,
  essays, and notes.
- `content/faq.json` (16 grounded Q&A) feeds the assistant's retrieval only; no page
  shows it. The assistant's profile passage is built from `content/resume.ts`,
  `config/site.ts`, `content/flagship` and `content/pages/hire.ts`, and its skills
  passages from `content/resume.ts` (`content/skills.json` was removed). Name, role,
  email, location and socials live in `config/site.ts`, and the summary in
  `content/resume.ts`. `content/profile.json` (`focus`, `tagline`, `ethos`,
  `headshot`) is still in the tree, but no code reads it since the assistant's
  rewrite.

There are no contact forms: contact is `/contact` (email, an optional booking link,
the assistant), with `/hire` as the careers-style page.

**Stack evidence — the "Used in" rule.** `/uses` and `/skills` link a tool to a
case study only through `components/misc/stack-evidence.ts`, which reads each
flagship's typed stack (`content/flagship`: the technology by layer and the AWS
services, each service also under its short name — "Amazon ECS" is "ECS" — and every
AWS-hosted product under "AWS") and the `stack` frontmatter of each
`content/projects/<slug>.mdx` (its languages first, as the project's public repository
reports them, then its frameworks and services), with a small alias table (e.g.
`postgresql` ↔ `postgres`, and `javascript` for LLM Studio's "Vanilla JS"). Compound
entries count for each tool they join ("C# on .NET 10",
"PostgreSQL 17 with pgvector"). The flagships come first, in the site's order of
work. If a case study does not list the tool, no "Used in" link is drawn; a link is
never asserted by hand. The per-tool sentences on `/uses` are `TOOL_NOTES` in
`content/pages/uses.ts`.
The newsletter sign-up at the foot of `/writing` and `/notes` (`NewsletterForm`,
`components/features/newsletter-form.tsx`; its copy is `writingPage.newsletter`) is off
unless `NEXT_PUBLIC_BUTTONDOWN_USERNAME` is set; it has no committed default, so it stays
hidden until the Buttondown list is confirmed to deliver, and `/privacy` names Buttondown
only while it is on.

---

## 6. MDX component map

`components/mdx/mdx-components.tsx` binds markdown elements to the shared reading
scale (`components/mdx/prose.ts`; `h2`/`h3` get slug ids) and exposes six custom
blocks inside MDX: `Callout` · `PullQuote` (long-form only) · `CodeBlock`
(filename + copy) · `Figure` · `DecisionLog` · `FailureLog`. Other evidence
components, such as `SystemDiagram` and `MetricsTable`, are imported directly by
case-study components and are not available in MDX. Plain markdown everywhere else —
component soup is an anti-pattern; if a section reads fine as prose, it stays prose.

---

## 7. Voice (applies to every file above)

First person singular. Plain, precise, short sentences. Numbers over adjectives; why
before what. Sentence case. Banned: passionate, innovative, cutting-edge, seamless,
leverage(v), revolutionize, world-class, blazing, 10x, ninja/guru/wizard, "simple yet
powerful". Every claim must be provable by something on the page.

---

## 8. Positioning and off-site alignment

- A positioning line makes one claim that the rest of the page proves: the kind of
  systems, who they serve, and the evidence. No adjectives, no buzzwords. The approved
  role (`SITE.role`), supporting descriptor, and experience statement are recorded in
  ADR-015.
- LinkedIn, the GitHub profile (pinned repositories that match the case studies), and
  the résumé PDF state the same role, projects, and metrics as the site; any mismatch
  costs the trust the site exists to build.
