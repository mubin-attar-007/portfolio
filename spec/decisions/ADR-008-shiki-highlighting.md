# ADR-008 — Shiki for code highlighting

Status: Accepted

## Decision
Shiki at build time via the MDX pipeline; custom light/dark themes mapped to design
tokens; zero client JS for highlighting.

## Alternatives
Prism (runtime or build) — weaker grammars, theme drift from tokens; highlight.js —
runtime cost. Both rejected: code samples are first-class content here and must render
perfectly with no JS.

## Consequences
Slightly slower builds; irrelevant at this scale.
