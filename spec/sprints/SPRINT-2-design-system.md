# SPRINT 2 — Design system

> **Paste to Claude Code:**
> Read spec/DESIGN.md fully (again) — §3 and §9 are the contract for this sprint — plus
> spec/CONTENT_MODEL.md §6. Implement task by task. Every component ships with JSDoc per
> ENGINEERING §3, all states on /dev/components in BOTH themes, and tests where logic exists.

**Goal:** every primitive the content will ever need, perfected in isolation.
**Exit demo:** /dev/components is a complete, axe-clean, keyboard-navigable gallery.

## Tasks

### T1 — Typography & Prose
`Prose` (MDX wrapper): body 68ch, heading scale/tracking per DESIGN §1.3, underlined
in-prose links, lists, blockquote, hr, footnotes styling, `PullQuote` (Newsreader italic).
**AC:** a lorem MDX fixture renders beautifully in both themes; heading anchors present.

### T2 — Core primitives
Button (primary/secondary/ghost, sizes, loading, `asChild` link support) · Link ·
Tag · SectionHeading (xs mono kicker + heading) · PageHeader · Card(quiet) · Callout
(note/caution variants).
**AC:** hover/focus/active/disabled all specified states; one-primary-per-viewport noted
in JSDoc; axe clean.

### T3 — Evidence primitives
`Metric` (mono tabular value, delta ▲▼ + color + text, footnote sup link) · `MetricsRow`
· `MetricsTable` (hairline rows, method column) · `Footnote`/`Evidence` (numbered,
back-links) · `BeforeAfter`.
**AC:** unit tests for delta direction/formatting; footnote jump + return works by keyboard.

### T4 — Code & terminal
`CodeBlock`: Shiki build-time themes mapped to tokens, filename bar, copy button
(client leaf), line highlight support. `TerminalRecording`: lazy asciinema-player,
poster + play affordance, framed Figure with caption; ~0 KB until interaction.
**AC:** copy works + announces to screen readers; recording never loads JS before click;
code renders with JS disabled.

### T5 — SystemDiagram v1
Typed data (`nodes[{id,label,sublabel?,x,y,w?}]`, `edges[{from,to,label?}]`), HTML nodes
+ SVG orthogonal connectors, hover/focus shows description panel, arrow-key navigation
between nodes, roving tabindex, server-rendered narration list as fallback/`<noscript>`.
Style per DESIGN §3 (documentation look, not product demo).
**AC:** fully keyboard operable; axe clean; a sample "RAG pipeline" diagram on preview
route; reduced-motion honored; component ≤ 8 KB gz.

### T6 — DecisionLog & FailureLog
Per CONTENT_MODEL §1.2 shapes. DecisionLog rows: choice / alternatives / reason /
trade-off accepted. FailureLog: version → metric → value (negative color for the bad
one) → cause/fix, vertical timeline feel, quiet.
**AC:** render fixtures from CONTENT_MODEL examples pixel-cleanly; unit tests for row logic.

### T7 — Figure + theme QA + a11y suite
`Figure` (border, radius-lg, caption). Then: full pass of /dev/components in dark theme
fixing token gaps; extend Playwright axe suite to the preview route.
**AC:** zero axe violations on /dev/components; no visual regressions between themes
(manual screenshot compare, attach to PR).

## Definition of Done
[ ] Every CONTENT_MODEL §6 component exists  [ ] All states, both themes, on preview route
[ ] JSDoc per contract  [ ] Logic tests passing  [ ] axe zero violations  [ ] Budgets:
no primitive adds client JS except allowlisted leaves  [ ] DESIGN §9 audit: nothing banned crept in
