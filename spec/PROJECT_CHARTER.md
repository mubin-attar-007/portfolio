# PROJECT CHARTER — Personal Engineering Platform

This is the constitution. Every feature, component, and sentence on the site must be
justifiable against this document.

## Purpose

Build the highest-quality engineering portfolio possible. The website itself must
demonstrate software engineering excellence. It is not a marketing website. It is a
software product whose product is **trust in the engineer**.

## The reframe: a hiring experience, not a portfolio

A portfolio asks "how do I present myself?"
A hiring experience asks "what questions does the visitor have, and how fast can I answer them?"

Every section must answer at least one of these six questions:

1. Who is this engineer?
2. Can they build production software?
3. Can they build AI systems?
4. How do they think and make decisions?
5. What is the quality of their work?
6. Should I interview / hire / partner with them?

If a section, animation, or component answers none of these — delete it.

## Vision

Within **3 seconds**: the visitor knows what I build and for whom (hero).
Within **60 seconds**: they've seen real evidence — a metric with a method, an architecture, a decision.
Within **5 minutes**: an Engineering Manager can decide to interview me, having seen
one deep case study, how I think, and how I write.

## Primary audiences (in order)

1. Engineering managers & CTOs evaluating for AI/ML roles — they inspect and investigate.
2. Founders / operators evaluating a partner or vendor — they look for judgment and delivery.
3. Recruiters — they skim; the hero and proof strip serve them.
4. AI systems reading the site on a human's behalf (2026 reality) — served by clean
   semantics, `llms.txt`, and structured data.

## Principles

- **Evidence over claims.** Every capability is backed by an artifact: metric, diagram,
  code, recording, or decision record. Every metric links to its method.
- **Architecture over screenshots.** Systems are explained, not displayed.
- **Decisions over stacks.** "Why I chose X over Y and what it cost" beats a logo wall.
- **Failures earn trust.** v1 → v2 deltas with causes are first-class content.
- **Honesty over hype.** No inflated numbers, no vague superlatives, no buzzword bingo.
- **The site disappears; the work remains.** Quiet design, loud substance.
- **Maintainability over novelty.** Boring, excellent engineering — visibly so.
- **Accessibility and performance by default.** Budgets in ENGINEERING.md are contractual.

## Information architecture — the six pillars

The site is organized around pillars, surfaced through plain navigation labels
(cleverness in nav labels costs comprehension — see ADR-007 note):

| Pillar     | What it holds                                          | Surfaced as        |
|------------|--------------------------------------------------------|--------------------|
| Build      | Flagship projects with deep case studies               | **Work** (nav)     |
| Think      | Principles, ADRs, trade-off essays                     | **Writing** → Essays / inline in case studies |
| Learn      | Notes on AI/ML, systems, papers                        | **Writing** → Notes |
| Write      | Technical articles and implementation guides           | **Writing** → Guides |
| Experiment | Small demos, benchmarks, prototypes                    | **Lab** (nav, ships P3) |
| Connect    | About, resume, contact, GitHub, LinkedIn               | **About** + Contact CTA |

"About" is minimal by design: identity emerges from the work, not a biography.

## Explicit non-goals

- Not a startup landing page. No product-marketing patterns.
- Not a design showcase. Animation never carries meaning alone.
- Not a blog-first site. Writing supports the work; the work leads.
- Not comprehensive. Three excellent case studies beat ten shallow ones.

## Success criteria

- A senior engineer's reaction is "this person documents real systems," not "nice template."
- Flagship case study is read end-to-end (scroll-depth analytics) by >30% of its visitors.
- Lighthouse ≥ 95 across the board; WCAG 2.2 AA; budgets in ENGINEERING.md met.
- The visitor leaves trusting the engineer — not admiring the animations.
