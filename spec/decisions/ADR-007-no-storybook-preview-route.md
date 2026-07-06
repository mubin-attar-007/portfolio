# ADR-007 — /dev/components preview route instead of Storybook

Status: Accepted

## Context
Component development needs a place to see all primitives, states, and themes together.

## Decision
A single `/dev/components` route (noindex, excluded from prod nav) rendering every
primitive in all variants/states, light+dark, and serving as the axe test surface.

## Why
Storybook is a second build system to maintain solo; the preview route runs in the real
app context (real tokens, real RSC boundaries), is covered by the same CI, and costs ~0.

Related nav-label decision: pillar names (Build/Think/Learn/Write/Experiment/Connect)
remain the information architecture, but nav uses plain labels (Work/Writing/Lab/About)
— clever labels tax first-time comprehension, and the hero has 3 seconds to land.
