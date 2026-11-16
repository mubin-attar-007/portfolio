# CONTENT_MODEL.md — Schemas & templates

Site copy lives in `content/` and `config/site.ts`. Projects, evaluations and the
timeline are typed TypeScript modules parsed with Zod at module load; writing, notes
and `/now` frontmatter is validated with Zod when it is loaded. Either way, invalid
content throws and the build fails, and the types are inferred from the schemas in
`content/schema.ts` — never hand-written. The résumé and the page-copy modules
(`site.ts`, `home-visual.ts`, `article.ts`) are `as const` objects that TypeScript
checks but no schema validates.

---

## 1. Projects and case studies (the heart of the site)

### 1.1 Project record — `content/projects.ts` (`ProjectSchema`)

```ts
{
  slug: string,
  title: string,                    // system name, not a marketing name
  summary: string,                  // ≤ 160 chars; the case-study lede and the page's search description
  status: "deployed-demo" | "active-development" | "experiment" | "archived",
  role: string,                     // "Designed, built, and maintained (solo)"
  timeline: string,                 // "2025 – present"
  featured: boolean,                // exactly ONE project is featured (asserted by test/content.test.mts)
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
keeps its recording and source. Restore `links.live` when the host runs again.

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
  captions, and its poster (the poster is also the card capture), wired in
  `app/work/[slug]/page.tsx`.
- `content/dbwhisper-walkthrough.ts` and `content/dbwhisper-boundary.ts` — curated,
  labelled sample data for the walkthrough and the homepage inspector; never measured
  results. The walkthrough's Evaluate stage is the exception: its counts are read from
  the eval registry (`DBWHISPER_EVIDENCE`), never typed.

### 1.4 Compliance rule (healthcare content)

Healthcare work, such as the Sevina role, is described by aggregate metrics and
methodology only. No PHI, no resident-level data, no facility-identifiable claims
figures, no payer contract terms. All screenshots reproduced with synthetic data. When
in doubt: describe the mechanism, omit the number.

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
  stale; the homepage shows the first three `exploring` items. Loaded by `lib/now.ts`.

Writing and notes share the draft rule: `draft: true` removes an entry from indexes,
feeds, the sitemap, and generated routes in production, and keeps it previewable in
`next dev`.

---

## 4. Structured records

- **Timeline — `content/timeline.ts` (`TimelineSchema`):** `{ period, role, org?, order,
  built, learned, mistake, changed }`, rendered on `/about`. Growth over titles; the
  `mistake` field is required — it is the credibility engine of the section.
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
    branch.
  - `test/evidence.test.mts` fails when any surface quotes a retired figure or a
    deleted scale claim, when code retypes a registry figure, or when static text
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
  until a résumé, site-config, or registry change is followed by a regeneration. The
  PDF links the site, every case study, every method, every source, and only the
  demos that are up. Site, PDF, and LinkedIn must carry identical facts. The
  download link emits the `resume_downloaded` analytics event.

---

## 5. Site and page copy

- `config/site.ts` — name, role (`role` for labels and titles, `roleInSentence`
  inside a sentence — never `role.toLowerCase()`, which lowercases "AI"), the site
  description (`SITE.description`, ≤ 160: the homepage's search description and the
  default), email, location, socials, integrations, the availability line (`STATUS`),
  and footer copy.
- `config/nav.ts` — primary navigation, the header's one action, and the footer map.
- `content/home-visual.ts` — homepage copy (`flagshipHome`).
- `content/site.ts` — copy for `/about`, `/hire`, `/uses`, `/trust`, `/now`, the
  index pages and the 404 (`pages`), plus the proof row and principles.
- `content/article.ts` — article header and footer labels shared by case studies,
  essays, and notes.
- `content/profile.json` — only what nothing else holds: `focus`, `tagline` and
  `ethos` (the assistant's profile passage) and `headshot` (the homepage engineer
  strip). Name, role, email, location and socials live in `config/site.ts`, and the
  summary in `content/resume.ts`. `content/faq.json` (15 grounded Q&A) feeds the
  assistant's retrieval only; the assistant's skills passages come from
  `content/resume.ts` (`content/skills.json` was removed).

There are no contact forms: contact is email, `/hire`, and an optional booking link.
The newsletter form on `/writing`, `/notes`, and their articles is off unless
`NEXT_PUBLIC_BUTTONDOWN_USERNAME` is set; it has no committed default, so it stays
hidden until the Buttondown list is confirmed to deliver.

---

## 6. MDX component map

`components/mdx/mdx-components.tsx` binds markdown elements to the shared reading
scale (`components/mdx/prose.ts`; `h2`/`h3` get slug ids) and exposes six custom
blocks inside MDX: `Callout` · `PullQuote` (serif italic, long-form only) · `CodeBlock`
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
