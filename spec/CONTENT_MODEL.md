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
  summary: string,                  // ≤ 200 chars; the case-study header paragraph
  status: "production" | "active-development" | "experiment" | "archived",
  role: string,                     // "Designed, built, and maintain (solo)"
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
  **not rendered on the site**; `lib/ai/retrieval.ts` chunks it by `##` heading into the
  assistant's corpus, so keep it consistent with the case study. Its frontmatter is not
  schema-validated.
- `public/demos/<slug>.webm`, `.vtt`, and `.webp` — the product recording, its
  captions, and its poster (the poster is also the card capture), wired in
  `app/work/[slug]/page.tsx`.
- `content/dbwhisper-walkthrough.ts` and `content/dbwhisper-boundary.ts` — curated,
  labelled sample data for the walkthrough and the homepage inspector; never measured
  results.

### 1.4 Compliance rule (healthcare content)

Healthcare work, such as the Sevina role, is described by aggregate metrics and
methodology only. No PHI, no resident-level data, no facility-identifiable claims
figures, no payer contract terms. All screenshots reproduced with synthetic data. When
in doubt: describe the mechanism, omit the number.

---

## 2. Writing — `content/writing/*.mdx` (`WritingSchema`)

```ts
{ title, summary (≤ 220), date, updated?,
  category: "essay" | "guide" | "note",
  topics: string[], draft: boolean }          // slug comes from the file name
```

- **essay** — trade-offs and judgment.
- **guide** — implementation, reproducible, code-heavy.
- **note** — a short piece inside the writing archive.

Loaded by `lib/writing.ts` through `lib/mdx-collection.ts`. Essays are best mined from
a case study's Key decisions.

---

## 3. Notes and /now

- **Notes — `content/notes/*.mdx` (`NoteSchema`):** `{ title, date, tags (≥ 1),
  source?: url, draft }`. Short, dated, tag-indexed; `/notes` filters by tag. Loaded by
  `lib/notes.ts`.
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
  result, status: "in-progress" | "complete" | "planned", date?, note?, link? }`. An
  unfinished run renders muted, never as a result. `evalAnchor()` builds `/evals`
  anchors; `requireEval()` throws if a referenced row is renamed or removed;
  `DBWHISPER_GOLDEN` is the single source of the homepage ratios.
- **Résumé — `content/resume.ts`:** the single source for `/resume`, `/skills`, the
  assistant, and `public/Mubin_Attar_Resume.pdf` (regenerate with
  `node --import ./test/alias-loader.mjs scripts/build-resume-pdf.mts`; the loader
  resolves the `@/` alias that `config/site.ts` imports). Site, PDF, and LinkedIn must
  carry identical facts. The download link emits the `resume_downloaded` analytics
  event.

---

## 5. Site and page copy

- `config/site.ts` — name, role, email, location, socials, integrations, the
  availability line (`STATUS`), and footer copy.
- `config/nav.ts` — primary navigation, the header's one action, and the footer map.
- `content/home-visual.ts` — homepage copy (`flagshipHome`).
- `content/site.ts` — copy for `/about`, `/hire`, `/uses`, `/trust`, `/now`, and the
  index pages (`pages`), plus the proof row and principles.
- `content/article.ts` — article header and footer labels shared by case studies,
  essays, and notes.
- `content/profile.json` — profile fields for the homepage engineer strip and the
  assistant; `content/faq.json` (14 grounded Q&A) and `content/skills.json` feed the
  assistant's retrieval only.

There are no contact forms: contact is email, `/hire`, and an optional booking link.

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
