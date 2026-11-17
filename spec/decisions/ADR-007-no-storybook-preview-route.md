# ADR-007 — /dev/components preview route instead of Storybook

Status: Accepted. Navigation facts updated 2026-11-13 and 2026-11-17; metadata facts
2026-11-16.

## Context
Component development needs a place to see all primitives, states, and themes together.

## Decision
A single `/dev/components` route (`app/dev/components/page.tsx`) — `noindex`, disallowed
in `robots.ts`, absent from the navigation, and with no canonical URL or social card
of its own — rendering the primitives in their variants and states. It is one of the
routes the accessibility gate audits, and the metadata gate checks it
stays unindexed.

## Why
Storybook is a second build system to maintain solo; the preview route runs in the real
app context (real tokens, real RSC boundaries), is covered by the same CI, and costs ~0.

Related nav-label decision: the pillar names in the charter (Build/Think/Learn/Write/
Experiment/Connect) remain the information architecture, but the navigation uses plain
labels — Work, Evals, Writing, About, plus two actions, Contact and Hire me
(`config/nav.ts`). Clever labels tax first-time comprehension, and the hero has 3
seconds to land.
