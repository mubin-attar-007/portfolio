# ADR-005 — Custom SystemDiagram over React Flow / Mermaid

Status: Accepted

## Context
Interactive architecture diagrams (hover to inspect, keyboard navigable, on-brand,
lightweight) are a core differentiator per the design brief.

## Decision
Build `SystemDiagram`: typed node/edge data files, HTML nodes + SVG orthogonal
connectors, CSS-grid/absolute layout per diagram, hover/focus → description panel,
arrow-key navigation, server-rendered list fallback (the narration) for no-JS/SEO/a11y.

## Alternatives considered
- **React Flow** — 40–70 KB+ gz, physics/pan/zoom we don't want; generic look. Rejected.
- **Mermaid** — fast to author, but limited visual control (violates DESIGN tokens),
  poor interactivity/a11y story. Rejected for case studies (fine for internal docs).
- **Static SVG exports (Excalidraw/Figma)** — no interactivity, unmaintainable text.

## Consequences
More upfront work for one component; in exchange: tiny bundle, exact brand fit, full
a11y control — and the component itself is portfolio evidence (write the guide post).
