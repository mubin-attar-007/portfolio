# Content and Message Audit v1 — P0-R2

## Inventory of user-facing content sources

| Source file | Export/object/section | Routes/components consuming it | Content category | Current source-state | Duplicated elsewhere | Potential canonical source | Main governance issue | Future action phase |
| --- | --- | --- | --- | --- | --- | --- | --- |
| content/site.ts | `SITE` object, `home`, `proof`, `capabilities`, `metrics` | `/`, `/about`, `/work`, `/resume`, `/evals`, `/trust`, `/skills`, `/uses`, `/notes`, `/writing`, `/api/chat` docs | Identity and role, Biography, Employment, Experience duration, Skills, Projects, Trust/security, Availability, Contact/conversion, Navigation and conversion copy | Source-present, authoritative for many copy blocks | `config/site.ts`, `components/layout/*`, `app/*` pages | Role variants and claim scope drift versus other sources | P1 |
| content/home-visual.ts | home visual copy and narrative fragments | `/` | Identity and role, Navigation and conversion copy | Source-present | `content/site.ts`, route-specific hero overrides | Repeated role framing and “reliability” language | P1 |
| content/resume.ts | `resumeData` summary, jobs, projects, skills, timeline | `/resume`, `/about`, `/work` data exports | Employment, Professional work, Projects, Skills, Experience duration | Source-present | `content/resume.json`, `app/resume/page.tsx` | Factual claims around production dates and role-tenure need one-source normalization | P1 |
| content/resume.json | Resume content mirror | `app/resume/page.tsx` | Employment, Skills, Projects, Experience duration | Source-present | `content/resume.ts` | JSON and TS sources may diverge if unsynchronized | P1 |
| content/projects.ts | `projects`, `featuredProjects`, status/maturity fields | `/work`, `/work/[slug]` | Projects, Demo status, Deployment status, Professional impact | Source-present | `content/resume.ts`, `content/faq.json` | “Production” and “live” terms can exceed operational evidence | P0-R4 + P1 |
| content/timeline.ts | career timeline events | `/` and `/about` references, `/timeline` if active | Experience timeline, Employment duration | Source-present | `content/resume.ts` | Historical entries may conflict with current tenure phrasing | P1 |
| content/faq.json | `faqItems`, interview-style public claims | `/about`, `/trust` | Trust/security, process, project details | Source-present | `content/site.ts`, components | Claims include scope qualifiers not always preserved in rendered summaries | P1 |
| content/skills.json | `skills` taxonomy | `/skills` | Skills, stack inventory | Source-present | `content/site.ts`, `content/resume.ts` | Skill taxonomy overlaps with resume blocks | P1 |
| content/now.mdx | current activity and narrative | `/now` | Current activity, availability | Source-present | none | Needs explicit freshness cadence | P1 |
| content/schema.ts | Type schema for content objects | all MDX/content imports | Content governance | Source-present | none | Schema does not enforce claim evidence completeness | P1 |
| content/writing/*.mdx | writing bodies and metadata | `/writing`, `/writing/[slug]` | Writing, biography, technical method, thought leadership | Source-present | `README`, `public/llms.txt` | May overstate recency if not regularly refreshed | P1 |
| content/notes/*.mdx | notes and technical commentary | `/notes`, `/notes/[slug]` | Writing, technical method, current learning | Source-present | `/writing` analogs | Notes can include speculative language | P1 |
| content/evals.ts | evaluation inventory + results | `/evals` | Evaluations, reliability, security | Source-present | `content/site.ts` | Sample size/date/context incomplete in some rows | P0-R4 + P1 |
| content/site-map.ts | section map and route metadata | sitemap and nav tooling | Metadata and indexing | Source-present | `app/sitemap.ts` | Route surface map does not fully match live behavior | P1 |
| content/llms.md* and `public/llms.txt` | external identity payload | crawlers, LLM readers | Metadata and machine-readable identity | Source-present | `README.md` | Public claim surface needs alignment with canonical route decisions | P1 |
| app/* metadata modules | route metadata exports | each routed page | Metadata and SEO | Source-present | `config/site.ts` | Title/role mismatch and stale route wording across copy | P1 |
| app/opengraph-image.tsx | Open Graph image renderer | social previews | Metadata and social identity | Source-present | dynamic OG route files | Visual and text fallback may not match owner-approved role terms | P1 |
| app/sitemap.ts | sitemap feed generation | `/sitemap.xml` | Sitemap/indexing exposure | Source-present | `content/site-map.ts` | Missing route source-state alignment for legacy paths | P1 |
| app/robots.ts | robots policy | `/robots.txt` | Indexing and crawl guidance | Source-present | `public/robots.txt` if any | `/home` and `/contact` policy clarity not explicit | P1 |
| app/rss.xml/route.ts | RSS route | `/rss.xml` | Distribution and metadata | Source-present | `app/writing/feed.xml/route.ts` | Duplicate feed semantics with different paths | P1 |
| app/writing/feed.xml/route.ts | writing-specific RSS | `/writing/feed.xml` | Metadata and SEO | Source-present | `app/rss.xml/route.ts` | Redundant distribution targets without explicit canonical designation | P1 |
| app/api/chat/route.ts | runtime contract, response behavior | assistant UI and integrations | Assistant knowledge and operational status | Source-present | trust docs and assistant components | Public contract should match user-facing guarantee wording | P0-R4 |
| app/dev/components/page.tsx | dev demo examples and request patterns | `/dev/components` | Assistant knowledge, demo status | Source-present | `components/features/assistant*` | `/api/ask` reference retained in internal component examples | P1 |
| components/features/assistant.tsx | assistant behavior and policy copy | assistant UIs | Assistant knowledge, trust, evidence handling | Source-present | `components/features/assistant-panel.tsx` | Terms like always/reliable can imply hard guarantees | P1 |
| components/features/assistant-panel.tsx | citation and chat affordances | assistant UIs | Assistant knowledge, trust | Source-present | assistant.tsx | Missing explicit edge-case and failure behavior in user copy | P1 |
| components/layout/header.tsx | header nav model and labels | global nav | Navigation and conversion | Source-present | `components/layout/footer.tsx` | Contact linked to `/hire`; no `/contact` page in current source | P1 |
| components/layout/footer.tsx | footer nav and links | global footer | Navigation and conversion | Source-present | header | No explicit `/contact` exposure | P1 |
| config/nav.ts | route labels and nav sections | all layouts | Navigation and conversion | Source-present | route components | canonical route decisions need separation from historical links | P1 |
| config/site.ts | shared metadata exports | global metadata/availability text | Identity and role, availability | Source-present | `content/site.ts` | Role string remains AI Software Engineer | P1 |
| README.md | architecture and portfolio intent | repository discovery, external review | Metadata and SEO, trust | Source-present | `public/llms.txt` | Public repository claims may drift from page copy | P1 |
| middleware/proxy.ts or equivalent | edge routing and rewrites | all routes | Route truth and compatibility | Source-present | app routing | Live behavior can differ from local route set | P0-R2 |
| public/llms.txt | external machine-readable profile | crawler/indexed metadata | Metadata and SEO | Source-present | `README.md` | Contains direct role and route claims requiring synchronization | P1 |

## Route and source mapping for high-signal content

| Route | Primary user-facing claim family | Source surface |
| --- | --- | --- |
| `/` | role, conversion, proof, trust, skills | `app/page.tsx`, `content/site.ts`, `content/home-visual.ts` |
| `/about` | biography and positioning statement | `app/about/page.tsx`, `content/resume.ts`, `content/now.mdx` |
| `/work` | evidence index and project credibility | `app/work/page.tsx`, `content/projects.ts` |
| `/work/[slug]` | deep project evidence and tradeoffs | `app/work/[slug]/page.tsx`, `content/projects.ts` |
| `/resume` | factual employment and career proof | `app/resume/page.tsx`, `content/resume.ts` |
| `/hire` | conversion and outreach | `app/hire/page.tsx`, header/footer nav |
| `/contact` | expected future canonical conversion | *No route file exists* |
| `/evals` | evaluation methodology and outcomes | `app/evals/page.tsx`, `content/evals.ts` |
| `/trust` | security and reliability framing | `app/trust/page.tsx`, `content/faq.json`, assistant components |
| `/skills` | stack and capability framing | `app/skills/page.tsx`, `content/skills.json` |
| `/uses` | tooling and environment footprint | `app/uses/page.tsx`, `content/site.ts` |
| `/now` | activity status | `app/now/page.tsx`, `content/now.mdx` |
| `/notes` | process history and notes | `app/notes/page.tsx`, `content/notes/*` |
| `/notes/[slug]` | technical assumptions and experiments | `app/notes/[slug]/page.tsx` |
| `/writing` | thought leadership evidence | `app/writing/page.tsx`, `content/writing/*` |
| `/writing/[slug]` | writing depth and argument quality | `app/writing/[slug]/page.tsx` |
| `/privacy` | policy and data practice statement | `app/privacy/page.tsx` |
| `/timeline` | historical context | route is not in current source | P0-R2 |
| `/talks` | public speaking history | route is not in current source | P0-R2 |
| `/changelog` | change record | route is not in current source | P0-R2 |
## Page-by-page messaging audit

### `/`
- Intended audience: recruiters, collaborators, operators, AI engineers.
- Current core message: “Applied engineer profile with production AI systems and evaluation/deployment focus.”
- Current role signal: mixed between AI Software Engineer and AI/ML Engineer.
- Current proof: project teaser and trust/evaluation statements.
- Main CTA: work and hire pathways.
- Content strengths: clear navigation and evidence-oriented structure.
- Content weaknesses: repeated production/liveness claims without immediate public proof.
- Repeated concepts: production AI, reliable AI, evidence, end to end.
- Unsupported/risky claims: live/product claims and deterministic/zero-write language without operational scope.
- Missing information: explicit route/canonical contact mapping and per-project deployment status.
- Personal warmth: moderate.
- Collaboration signal: medium.
- Business-impact signal: medium.
- Recruiter scanability: medium-high.
- Technical depth: medium.
- Conversion clarity: medium.
- Future rewrite priority: High.
- Responsible future phase: P1.

### `/about`
- Intended audience: hiring managers and collaborators.
- Current core message: biography and transition narrative with AI project work.
- Current role signal: variable naming variants.
- Current proof: timeline and experience summary.
- Main CTA: professional inquiry links.
- Content strengths: coherent narrative shape.
- Content weaknesses: role/title drift and repetitive positioning language.
- Repeated concepts: role variants, production AI, collaboration.
- Unsupported/risky claims: exact transitions and tenure boundaries.
- Missing information: clearer continuity from education to current employment.
- Personal warmth: high.
- Collaboration signal: high.
- Business-impact signal: medium.
- Recruiter scanability: medium.
- Technical depth: medium-high.
- Conversion clarity: medium.
- Future rewrite priority: Medium.
- Responsible future phase: P1.

### `/work`
- Intended audience: technical evaluators and hiring teams.
- Current core message: portfolio evidence index.
- Current role signal: engineering ownership and systems thinking.
- Current proof: project cards and status terms.
- Main CTA: explore deep project pages.
- Content strengths: discoverability and depth map.
- Content weaknesses: “production/live” labels often not operationally scoped.
- Repeated concepts: production AI, AI systems, evaluation.
- Unsupported/risky claims: active/production claims without deploy health evidence.
- Missing information: runtime status and maintenance notes per project.
- Personal warmth: low-medium.
- Collaboration signal: medium.
- Business-impact signal: low-medium.
- Recruiter scanability: high.
- Technical depth: high.
- Conversion clarity: medium.
- Future rewrite priority: High.
- Responsible future phase: P1.

### `/work/[each project]`
- Intended audience: technical peers, evaluators, enterprise stakeholders.
- Current core message: detailed proof narrative with architecture and outcomes.
- Current role signal: strong ownership framing.
- Current proof: implementation notes and links.
- Main CTA: inspect linked systems and artifacts.
- Content strengths: high technical specificity.
- Content weaknesses: public availability and maintenance state not always validated.
- Repeated concepts: reliability, production terms, scale.
- Unsupported/risky claims: some public availability claims.
- Missing information: authentication, cold start, and degraded behavior notes.
- Personal warmth: low.
- Collaboration signal: low-medium.
- Business-impact signal: variable by project.
- Recruiter scanability: high.
- Technical depth: high.
- Conversion clarity: medium.
- Future rewrite priority: Medium-high.
- Responsible future phase: P0-R4 + P1.

### `/resume`
- Intended audience: recruiters and interviewers.
- Current core message: factual work and capability proof.
- Current role signal: strong but with timeline and naming mismatch.
- Current proof: dates, titles, project summary.
- Main CTA: contact and portfolio follow-through.
- Content strengths: strongest resume evidence area.
- Content weaknesses: inconsistent tenure wording.
- Repeated concepts: AI/ML, production AI, healthcare context.
- Unsupported/risky claims: exact timeline continuity.
- Missing information: ownership of business outcomes and confidentiality scope.
- Personal warmth: medium.
- Collaboration signal: medium.
- Business-impact signal: medium-high.
- Recruiter scanability: high.
- Technical depth: medium.
- Conversion clarity: medium.
- Future rewrite priority: High.
- Responsible future phase: P1.

### `/hire`
- Intended audience: recruiters and outreach.
- Current core message: direct conversion path.
- Current role signal: implicit from neighboring context.
- Current proof: direct routing and CTA.
- Main CTA: connect.
- Content strengths: conversion path is direct.
- Content weaknesses: route mismatch with future canonical direction.
- Repeated concepts: availability and openness.
- Unsupported/risky claims: minimal; route decision risk is governance.
- Missing information: explicit role type and response expectation.
- Personal warmth: medium.
- Collaboration signal: high.
- Business-impact signal: medium.
- Recruiter scanability: high.
- Technical depth: low.
- Conversion clarity: high.
- Future rewrite priority: Medium.
- Responsible future phase: P1.

### `/evals`
- Intended audience: AI practitioners and technical evaluators.
- Current core message: evaluation rigor and benchmarking process.
- Current role signal: quality-led engineering.
- Current proof: metric tables and evaluation narratives.
- Main CTA: assess artifact quality.
- Content strengths: methodology-first posture.
- Content weaknesses: some percentages without date/sample-size details.
- Repeated concepts: evaluation, reliability, refusal behavior.
- Unsupported/risky claims: incomplete benchmark provenance in some entries.
- Missing information: baseline and version context.
- Personal warmth: medium.
- Collaboration signal: medium.
- Business-impact signal: medium.
- Recruiter scanability: medium-high.
- Technical depth: high.
- Conversion clarity: medium.
- Future rewrite priority: High.
- Responsible future phase: P1.

### `/trust`
- Intended audience: enterprise and privacy-sensitive users.
- Current core message: secure and responsible AI system posture.
- Current role signal: responsible AI engineer.
- Current proof: trust and security statements.
- Main CTA: move toward hire/contact for deeper governance review.
- Content strengths: strong conceptual framing.
- Content weaknesses: absolute safety claims and guarantee phrasing.
- Repeated concepts: secure, reliable, isolated, guardrail.
- Unsupported/risky claims: full-protection statements without explicit boundary mapping.
- Missing information: technical enforcement map.
- Personal warmth: medium.
- Collaboration signal: high.
- Business-impact signal: medium.
- Recruiter scanability: high.
- Technical depth: medium-high.
- Conversion clarity: medium.
- Future rewrite priority: Medium-high.
- Responsible future phase: P1.

### `/skills`
- Intended audience: technical hiring teams.
- Current core message: applied stack and capability breadth.
- Current role signal: practitioner through breadth.
- Current proof: list format.
- Main CTA: none.
- Content strengths: clarity of available stack.
- Content weaknesses: limited context around depth and outcomes.
- Repeated concepts: tooling breadth.
- Unsupported/risky claims: none explicit.
- Missing information: explicit proficiency and ownership depth.
- Personal warmth: medium-low.
- Collaboration signal: medium.
- Business-impact signal: low-medium.
- Recruiter scanability: high.
- Technical depth: medium.
- Conversion clarity: low.
- Future rewrite priority: Medium.
- Responsible future phase: P1.

### `/now`
- Intended audience: network, collaborators.
- Current core message: current direction.
- Current role signal: consistent with headline.
- Current proof: direct current-activity prose.
- Main CTA: keep contact context up to date.
- Content strengths: freshness impression.
- Content weaknesses: no hard update policy.
- Repeated concepts: active work, reliability.
- Unsupported/risky claims: stale phrasing risk.
- Missing information: explicit last-updated and verification cadence.
- Personal warmth: high.
- Collaboration signal: high.
- Business-impact signal: medium.
- Recruiter scanability: medium.
- Technical depth: low-medium.
- Conversion clarity: medium.
- Future rewrite priority: Medium.
- Responsible future phase: P1.

### `/uses`
- Intended audience: peers and operators.
- Current core message: stack choices and tooling context.
- Current role signal: hands-on builder.
- Current proof: list of tools and environments.
- Main CTA: none.
- Content strengths: practical details.
- Content weaknesses: little operational caveat context.
- Repeated concepts: cost-free stack and infrastructure.
- Unsupported/risky claims: `$0` and free-tier claims often decontextualized.
- Missing information: limits and tradeoffs.
- Personal warmth: medium.
- Collaboration signal: medium.
- Business-impact signal: low-medium.
- Recruiter scanability: medium-high.
- Technical depth: low-medium.
- Conversion clarity: low.
- Future rewrite priority: Medium.
- Responsible future phase: P1.

### `/writing`
- Intended audience: operators, peers, evaluators.
- Current core message: method and thinking depth.
- Current role signal: reflective technical practitioner.
- Current proof: published narrative and references.
- Main CTA: read and evaluate posts.
- Content strengths: thoughtful depth and authenticity.
- Content weaknesses: weaker evidence tagging per piece.
- Repeated concepts: AI systems, evaluation, production.
- Unsupported/risky claims: low-risk, mostly interpretive.
- Missing information: standardized fact tags and dates.
- Personal warmth: high.
- Collaboration signal: medium.
- Business-impact signal: medium.
- Recruiter scanability: medium.
- Technical depth: medium-high.
- Conversion clarity: medium.
- Future rewrite priority: Low-medium.
- Responsible future phase: P1.

### `/notes`
- Intended audience: collaborators and future clients.
- Current core message: process and decision records.
- Current role signal: introspective engineer.
- Current proof: reasoning depth.
- Main CTA: review notes and contact.
- Content strengths: candid operational thinking.
- Content weaknesses: variable editorial rigor and claim maturity.
- Repeated concepts: architecture rationale, reliability.
- Unsupported/risky claims: hypothetical statements presented as near-final.
- Missing information: evidence labels and confidence levels.
- Personal warmth: high.
- Collaboration signal: high.
- Business-impact signal: medium.
- Recruiter scanability: low-medium.
- Technical depth: high.
- Conversion clarity: low-medium.
- Future rewrite priority: Medium.
- Responsible future phase: P1.

### `/privacy`
- Intended audience: privacy-aware users and enterprise prospects.
- Current core message: data handling and privacy posture.
- Current role signal: careful and policy-aware owner.
- Current proof: textual policy.
- Main CTA: informed consent and policy understanding.
- Content strengths: explicit policy presence.
- Content weaknesses: light enforcement detail.
- Repeated concepts: privacy, consent, retention.
- Unsupported/risky claims: generic policy claims without control mapping.
- Missing information: audit trail and test evidence.
- Personal warmth: low-medium.
- Collaboration signal: medium.
- Business-impact signal: medium.
- Recruiter scanability: medium.
- Technical depth: medium.
- Conversion clarity: medium.
- Future rewrite priority: Medium.
- Responsible future phase: P1.
### Assistant content and social previews
- Intended audience: chat users and external preview consumers.
- Current core message: grounded, retrieval-oriented assistant behavior.
- Current role signal: technical AI operator.
- Current proof: component text and API route contract references.
- Main CTA: start a chat and request deeper review.
- Content strengths: strong evidence framing.
- Content weaknesses: reliability wording can be over-strong.
- Repeated concepts: grounded, safe, citations, trustworthy.
- Unsupported/risky claims: absolute phrases in helper copy.
- Missing information: explicit fallback, error handling, and performance caveats.
- Personal warmth: medium-high.
- Collaboration signal: high.
- Business-impact signal: medium.
- Recruiter scanability: low-medium.
- Technical depth: medium-high.
- Conversion clarity: medium.
- Future rewrite priority: Medium.
- Responsible future phase: P1.

## Phrase repetition and idea concentration

| Phrase | Frequency (approximate) | Source surfaces | Assessment |
| --- | --- | --- | --- |
| Applied AI | 6 | site constants, docs, strategy claims | aligns with approved brand intent but should be consistently deployed |
| AI/ML Engineer | 8 | resume, timeline, projects, metadata | factual but mixed with competing titles |
| AI Software Engineer | 10+ | config/site.ts, copy blocks, resumes | governance drift versus canonical positioning |
| production AI | 9+ | home, resume, projects, trust | repeated emphasis requires operational gating |
| reliable AI | 5+ | trust and assistant copy | good concept, avoid absolute framing |
| deterministic | 6+ | assistant and platform descriptions | should remain boundary-scoped |
| guardrail | 4+ | trust, FAQ, assistant claims | positive concept with missing control map |
| honest | 8+ | meta copy, narrative, trust copy | value signal can become defensive when repeated |
| real | 4+ | brand statements | moderate repetition, context dependent |
| fake | 4+ | anti-fake framing | defensive pattern that may reduce confidence |
| solo | 3+ | narrative and project attribution | overemphasis may understate collaboration |
| $0 | 4+ | home, uses, resume, llms txt | high-value but needs scope and limits |
| free tier | 4+ | same as above | similar risk as `$0` claims |
| always | 7+ | trust and assistant copy | highest-risk absolute claim term |
| never | 5+ | safety policy and value statements | high-risk unless scoped |
| zero writes | 3+ | project specs and trust claims | architectural guarantee requires enforcement proof |
| publicly testable | 2+ | projects, FAQ | should map to live verification evidence |
| live | 12+ | home, project pages, timeline | major repetition; currently operational evidence variable |
| evaluation | 9+ | evals and product pages | high alignment with positioning |
| evidence | 11+ | nearly all pages | strong concept and central narrative |
| end to end | 3+ | positioning and project language | useful but can overshadow business/ownership context |

### Repetition interpretation

- Positive reinforcement: applied AI, evaluation, evidence, reliable AI.
- Potential monotony risk: role labels and production/liveness terms.
- Credibility risk: “always/never/zero” phrasing.
- Conversion risk: over-technical repeated proof claims without business outcome context.

## Owner-input and confidentiality register

| Question | Why it matters | Routes affected | Confidentiality | Safe fallback | Phase |
| --- | --- | --- | --- | --- | --- |
| What is the exact canonical role phrase per route and metadata card? | Ensures consistency and ATS match | `/`, `/about`, `/resume`, OG metadata | Low | Keep approved brand term in planning-facing and factual term in employment sections | P1 |
| Are each project links currently active and stable? | Required for all “live” and “production” claims | `/work`, `/work/[slug]`, resume references | Medium | Change claims to “portfolio snapshot” until validated | P0-R4 |
| Which healthcare-related outcomes are publishable at role level? | Avoids disclosing restricted impact data | `/resume`, `/about`, `/work` | High | Publish anonymized or generalized outcomes | P1 |
| Can we claim “no writes” and “fail-closed” as full guarantees? | Avoids trust and security overstatement | `/trust`, `/home`, assistant features | Medium | Limit to scoped design intent plus checks | P1 |
| What is the verified meaning of “$0 stack” for each workload class? | Prevents infrastructure overclaim | `/`, `/uses`, metadata | Medium | Use explicit qualifiers and limits | P1 |
| Is /contact to be reintroduced before launch or should /hire remain current? | Routing and conversion strategy | `/hire`, `/contact`, global nav | Low | Maintain current route now and document migration plan | P1 |
| What is exact operational status of demos and eval interfaces? | Prevents “publicly testable” overclaims | `/work/[slug]`, `/evals`, dev assistant surfaces | Medium | Mark as pending operational verification | P0-R4 |

## Legacy/source-state notes for packet scope

- `/contact`: expected future canonical conversion route, but currently source-absent.
- `/timeline`, `/talks`, `/changelog`: route names appear in prior operational context or documentation, but no local page sources in this branch.
- `/api/ask`: still present in non-production examples and dev surfaces while canonical endpoint is `/api/chat`.
