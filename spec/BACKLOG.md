# BACKLOG.md — Epics → stories → sprints

Vision → Roadmap → Epics → Stories → Tasks → Code. No ambiguity, no guessing.
Detailed executable tasks live in `spec/sprints/`; this file is the map.

## Sprint plan

| Epic | Priority | Sprint | Exit criterion |
|---|---|---|---|
| E1 Foundation | P0 | 1 | Deployed shell on Vercel, CI green, tokens live |
| E2 Design system | P0 | 2 | All primitives in /dev/components, axe-clean |
| E3 Content system + Homepage + core pages | P0 | 3 | Home/Work/About/Resume live from content/ |
| E4 Flagship case study | P0 | 4 | One exceptional study, complete per template |
| E5 Engineering assistant | P1 | 5 | Grounded, evaled, rate-limited, shipped |
| E6 Writing + Timeline + Launch hardening | P1–P2 | 6 | 3 posts, timeline, SEO/llms.txt, budgets met |
| E7 AI Lab | P3 | Future | First interactive experiment |

## E1 Foundation
Stories: S1.1 init (Next+TS strict+Tailwind v4) · S1.2 tokens (zero hardcoded values
possible) · S1.3 quality tooling (eslint flat, prettier, vitest, playwright+axe) ·
S1.4 CI · S1.5 app shell (Header/Footer/Container/Section, nav, theme, skip-link) ·
S1.6 /dev/components scaffold · S1.7 deploy + analytics.
Sample AC (S1.5 nav): responsive; accessible; full keyboard nav; mobile drawer with focus
trap; visible active state; no accent except active item.

## E2 Design system
Stories: typography/Prose · Button/Link/Tag · Card(quiet)/SectionHeading/PageHeader ·
Metric/MetricsRow/MetricsTable · Callout/Figure/PullQuote · CodeBlock(Shiki+filename+copy)
· TerminalRecording(lazy) · SystemDiagram v1(hover+keyboard+text fallback) ·
DecisionLog/FailureLog/BeforeAfter/Footnote · dark-theme QA · axe suite on preview route.

## E3 Content + core pages
Stories: content-collections schemas(+fixture tests) · MDX pipeline(shiki, anchors,
footnotes) · homepage per DESIGN §4 tempo (hero AC: one headline, one paragraph, primary
+ ghost CTA, **no buzzwords, no skill badges, no animation beyond single fade**) ·
work index (featured feature + compact rows) · about · resume page+PDF · contact ·
404 · site config.

## E4 Flagship case study
Stories: author content (all 10 sections, real metrics+methods) · diagram data + narration
· terminal recording (asciinema, ≤ 90 s, real run, synthetic data) · study layout
(sticky quiet TOC ≥1280px, reading progress, prev/next, per-page OG) · second project
as compact stub row ("write-up in progress" is honest and fine).

## E5 Assistant — per AI_ASSISTANT.md
embeddings script · index · edge route(stream, rate-limit, cap) · panel UI · eval harness
in CI · injection suite.

## E6 Writing + Timeline + Launch
writing index+post layout · 2 essays + 1 guide (mined from case study DecisionLogs) ·
timeline page (Built/Learned/Mistake/Changed) · now section · llms.txt + sitemap + robots
+ JSON-LD + OG automation · perf pass to ENGINEERING §5 budgets · full a11y audit ·
analytics events · launch checklist (BRAND_POSITIONING §7 alignment).

## E7 AI Lab (future — do not build early; ship depth before breadth)
Candidates, each a self-contained lazy island under /lab with a 200-word "what this
demonstrates" note: RAG retrieval visualizer (your real index, live scoring) · token/
embedding explorer · prompt A/B comparator with eval scoring · model latency/cost
benchmark (cached runs) · agent-trace viewer. Priority order decided after launch
analytics show what visitors ask the assistant.

## Icebox (explicitly rejected for launch)
Comments · newsletter capture · CMS · i18n · view counters · testimonials carousel ·
GitHub contribution graph embeds · "skills" page.
