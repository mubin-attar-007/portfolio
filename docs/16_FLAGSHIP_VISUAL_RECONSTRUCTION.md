# Flagship homepage reconstruction

## Decision

The homepage is an editorial proof narrative, not a product-demo playground.
It is server-rendered, short enough to scan, and each claim connects to a case
study or measurement method.

## Composition

1. Left-aligned role statement, evidence promise, flagship CTA, and availability.
2. Compact linked proof rail.
3. DBWhisper flagship feature with metrics and a static controlled-execution map.
4. Three compact rows for the other live systems.
5. Three-part operating method: constrain, measure, publish.
6. Selected writing.
7. Current-focus snapshot.
8. Direct hiring close.

## Constraints

- Public claims come from typed project/content registries.
- Every visible product metric links to `#performance-cost` or the eval registry.
- The hero contains no image, animation, badge row, or product mockup.
- Static surfaces have no shadow, lift, glow, gradient, or spotlight.
- No client component is required by the homepage itself.
- Mobile content remains linear and legible with no horizontal canvas.
- Light is the default; dark bands provide measured structural rhythm.
- Primary navigation stays at five destinations.

## Implementation

- `app/page.tsx` loads the three writing previews.
- `components/home/flagship-home.tsx` owns semantic composition.
- `components/home/flagship-home.module.css` owns the scoped responsive layout.
- `content/home-visual.ts` owns homepage-specific narrative copy.
- `content/projects.ts` and the evaluation registry remain the proof sources.

The old client workbench, tabbed evidence receipt, animated capability scenes,
and product-scene CSS were removed. Their interaction cost and page length did
not add stronger hiring evidence than a direct architecture path and linked
methods.

## Signature

The reusable brand idea is the evidence loop:

**Constrain → measure → publish.**

It appears as plain language and method links, not as a decorative visual
effect. That keeps the site consistent with its central claim: evidence over
claims.
