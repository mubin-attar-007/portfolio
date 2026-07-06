# CONTENT_MODEL.md — Schemas & templates

All copy lives in `content/`. Collections are validated with Zod at build time; a schema
violation fails the build. Types are inferred — never hand-written.

---

## 1. Projects / case studies — `content/projects/*.mdx` (the heart of the site)

### 1.1 Frontmatter schema

```ts
{
  title: string,                    // "PDPM audit pipeline" — system name, not marketing name
  slug: string,
  summary: string,                  // ≤ 160 chars, plain, no adjectives
  status: "production" | "active-development" | "archived" | "experiment",
  role: string,                     // "Designed, built, and operate"
  timeline: string,                 // "2025 — present"
  featured: boolean,                // exactly ONE project has featured: true
  order: number,
  domain: string[],                 // ["healthcare", "reimbursement"]
  systems: string[],                // ["deterministic engine", "LLM-assisted review", "dashboards"]
  links?: { repo?: url, live?: url, writeup?: url },
  metrics: Array<{                  // 2–4; rendered by <MetricsRow/> in listings and hero of the study
    label: string,                  // "review time per assessment"
    before?: string, after: string, // "45 min" → "6 min"
    direction: "up-good" | "down-good",
    method: string                  // REQUIRED. One sentence: how measured, over what period/sample.
  }>,
  diagram?: string,                 // id of diagram data file in src/components/diagrams/data/
  recording?: string,               // /recordings/foo.cast
  ogTitle?: string
}
```

### 1.2 Body structure (fixed section order — headings exactly as written)

There is deliberately **no "Tech stack" section**. The stack surfaces naturally inside
Architecture and Decisions.

```mdx
## Context
What business/clinical problem, who feels it, what it costs. 2–3 short paragraphs. No jargon.

## Constraints
The real ones: regulatory, budget, latency, data quality, "solo operator", legacy systems.
Constraints make the later decisions legible.

## System architecture
<SystemDiagram id="..." />
One narration paragraph per major component: what it does and *why it exists*.
(The narration doubles as the diagram's text alternative.)

## Data flow
Trace ONE representative request/record end-to-end, referencing diagram nodes.

## Key decisions
<DecisionLog decisions={[
  { choice: "Deterministic rules engine, not an LLM, for validation",
    alternatives: ["LLM-as-judge", "hybrid"],
    reason: "Regulatory rules are enumerable; auditors need reproducibility; per-call cost at daily volume is unjustifiable.",
    tradeoff: "Rule maintenance burden; slower to cover novel edge cases." },
  ...
]} />
3–6 decisions. Each names rejected alternatives and the accepted cost. This section is
what senior readers screen for.

## What failed
<FailureLog entries={[
  { version: "v1", metric: "false-positive rate", value: "31%",
    cause: "single-pass retrieval / naive rule X", },
  { version: "v2", value: "11%", fix: "added reranking / rewrote rule with Y" },
]} />
Prose around it: how the failure was noticed, diagnosed, fixed. Minimum ONE genuine failure.

## Performance & cost
<MetricsTable ... />  — latency, throughput, cost per run/month, quality metrics.
Every number carries a method footnote. If a number can't be shared, explain the
mechanism and say so — never invent.

## Operations
How it runs daily: scheduling, monitoring, failure handling, an incident anecdote.
This section proves "production", the rarest claim on portfolios.

## What I'd do differently
2–4 honest items. Not humblebrags.

## Evidence
Links: repo, recording, related essays/ADRs, sanitized sample outputs.
```

### 1.3 Compliance rule (healthcare content)

Aggregate metrics and methodology only. No PHI, no resident-level data, no
facility-identifiable claims figures, no payer contract terms. All screenshots
reproduced with synthetic data. When in doubt: describe mechanism, omit number.

---

## 2. Writing — `content/writing/*.mdx`

```ts
{ title, slug, summary (≤160), date, updated?, 
  category: "essay" | "guide" | "note",   // Think | Write | Learn pillars
  topics: string[], draft: boolean, related?: slug[] }
```

- **essay** — trade-offs & judgment ("Why I replaced the LLM with 291 rules").
- **guide** — implementation, reproducible, code-heavy.
- **note** — shorter learning notes; imperfect is fine, dated is required.

Launch minimum: 2 essays + 1 guide. Each essay should be an extracted DecisionLog
expanded to ~1,200 words — write case studies first, mine them for essays.

---

## 3. Timeline — `content/timeline/*.md`

One file per phase, ordered. Growth over titles:

```ts
{ period: "2024–2025", role: string, org?: string, order: number }
```
Body (4 short labeled lines): **Built:** … · **Learned:** … · **Mistake:** … · **Changed:** how the mistake changed my approach.
The "Mistake" line is mandatory — it's the credibility engine of this page.

---

## 4. Site copy — `content/site/`

`home.md` (hero headline/sub/CTAs/proof-strip items with method footnotes, section
intros) · `about.md` (long bio per BRAND_POSITIONING §4, principles, optional portrait)
· `now.md` (3–5 bullets, dated, updated monthly) · `contact.md` (one sentence + email;
no forms at launch — email is lower friction and zero spam surface).

---

## 5. Resume — `content/resume/resume.md` + `/public/resume.pdf`

Markdown mirror of the PDF (for the assistant + machine readers). Rule: site, PDF, and
LinkedIn must carry **identical metrics**. `resume_downloaded` analytics event on the link.

---

## 6. MDX component map (built Sprint 2, used by all content)

`SystemDiagram` · `DecisionLog` · `FailureLog` · `MetricsTable` · `Metric` ·
`TerminalRecording` · `Figure` · `Callout` · `CodeBlock` (filename + copy) ·
`BeforeAfter` · `Footnote`/`Evidence` · `PullQuote` (serif italic, essays only).
Plain markdown everywhere else — component soup is an anti-pattern; if a section reads
fine as prose, it stays prose.

---

## 7. Voice (applies to every file above)

First person singular. Plain, precise, short sentences. Numbers over adjectives; why
before what. Sentence case. Banned: passionate, innovative, cutting-edge, seamless,
leverage(v), revolutionize, world-class, blazing, 10x, "simple yet powerful".
Every claim must be provable by something on the page.
