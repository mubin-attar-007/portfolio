# ADR-008 — Shiki for code highlighting

Status: Accepted. Implementation facts updated 2026-11-13.

## Decision
Shiki runs on the server inside the `CodeBlock` component (`components/ui/code-block.tsx`,
`codeToHtml`), so highlighting happens at render/prerender time with zero client JS (the
copy button is the only client island). It emits the GitHub high-contrast light and dark
themes as CSS variables; the dark palette activates under `[data-theme="dark"]`
(`styles/globals.css`). The high-contrast variants are used because the default GitHub
themes ship comment and keyword colours below WCAG AA.

## Alternatives
Prism (runtime or build) — weaker grammars, theme drift from tokens; highlight.js —
runtime cost. Both rejected: code samples are first-class content here and must render
perfectly with no JS.

## Consequences
Slightly slower builds; irrelevant at this scale.
