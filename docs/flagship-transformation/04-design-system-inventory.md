# 04 Design System Inventory

## Visual System Surfaces
- Tokenized CSS system present and theme scaffolding exists under:
  - `styles/tokens.css`
  - `styles/globals.css`
- Layout and editorial tone currently mix light-first palette blocks with dark utility sections.
- Design direction references are clear but partially inconsistent across source files.

## Surface inventory (baseline)
- Color system: explicit tokens and utility-level color usage exist; no single-source palette override currently enforced as single visual law.
- Typography: system appears typography-first with clear emphasis hierarchy.
- Spacing/rhythm: utility classes and design tokens used with section-level rhythm control.
- Grid/layout: responsive page structure with card/list/grid patterns and route-level sectioning.
- Breakpoints: responsive behavior appears implemented through utility classes and component styles; detailed breakpoints need consolidation.
- Radius/shadows: used consistently in card-like UI patterns.
- Motion: restrained animation exists; mostly functional, not decorative.
- Iconography and assets: icon imports and componentized usage; no external icon dependency issue observed.
- Buttons/forms/cards/nav: implemented as reusable components with shared style conventions.
- Technical diagrams: custom SVG/diagram components for architecture and evidence narratives.
- Dark sections: preserved in several routes and sections (not global default).

## Design-system concerns identified
- Theme direction contradiction: runtime default sets `data-theme="dark"` while design docs suggest light-first baseline with dark sections.
- Risk of visual identity drift from external references in narrative language and badge-like component cues.
- Need to codify “Original Visual Identity” checklist before implementing in Phase 1.
- Social preview validation currently relies on script-level budgets and metadata checks; keep as governance evidence.

## Derived or duplicate system fragments
- Some language and visual cues imply externally influenced startup-style tone.
- Legacy `dev/components` references and demo docs include older endpoint naming and should not be copied into flagship narrative components.

## Reusability / maintenance observations
- Token and global styles are already centralized but role-specific content claims are not yet fully centralized via a canonical contract file.
- Multiple content surfaces still duplicate positioning language and role descriptors across `content/site.ts`, `content/resume.ts`, and page-level prose.
