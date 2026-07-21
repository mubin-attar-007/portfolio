/**
 * The shared page-opening TOP: 128px, Clerk's measured section top. Every route
 * starts the same distance from the nav — their changelog opens content at
 * ~173px from the viewport top, and an article template opening 64px lower than
 * its index (the old `space="lg"` 192px top) is exactly the kind of seam that
 * made the site read as two templates.
 *
 * Use ALONE on a single-band page (an article, /hire) whose one `Section` also
 * carries the page's close — that keeps the band's own asymmetric bottom
 * (`md-end`/`lg-end`) instead of ending the page on the thin header seam.
 *
 * `!` prefix: `Section` writes its own `pt` from the SPACE map, and this is the
 * deliberate override at the call site.
 */
export const PAGE_TOP = "!pt-[var(--space-section-md)]";

/**
 * Shared rhythm for a page's opening band — the one place the site decides how
 * much air sits above an h1 and below its lede.
 *
 * Why it is a constant and not a `space` prop: `Section`'s scale is tuned for
 * BODY bands, where the asymmetric 128/172 pair (Clerk's measured rhythm) is
 * what closes a section off as a finished plate. A page header is not a finished
 * plate — its content continues in the very next band — so it gets the shared
 * 128px top and then only HALF the seam below (`xs`, 48px); the body band
 * underneath spends the other half. Total lede→content gap: ~96px, which is
 * what Clerk's pricing page measures between its subhead and the plan cards.
 * The previous `sm`+`sm` pairing (88+88) doubled that and pushed the first row
 * of real content out of the fold on every index route.
 *
 * Every gap on the page stays a sum of two tokens, so the rhythm can be
 * reasoned about from tokens.css rather than measured in a browser.
 */
export const PAGE_HEADER_BAND = `${PAGE_TOP} !pb-[var(--space-section-xs)]`;

/**
 * The body band directly under a page header — the other half of the pair above.
 *
 * Its top padding is pulled down to `xs` (48px) because the header band already
 * spent the first half of the seam; anything heavier re-opens the void the
 * constant above exists to close. The BOTTOM padding is left at the band's own
 * asymmetric end (172px on `md`), because this band usually IS the end of the
 * page and that heavier close is what makes it read as a finished plate rather
 * than content trailing off into the footer.
 *
 * Pair with `<Section space="md">` (or `lg` on an article): the class overrides
 * the top only.
 */
export const PAGE_BODY_BAND = "!pt-[var(--space-section-xs)]";

/**
 * One panel treatment for the whole site: surface fill, hairline, `radius-md`.
 *
 * Elevation is deliberately NOT baked in. Two `shadow-[…]` utilities on one
 * element resolve by generated-stylesheet order rather than by class order, so a
 * panel wanting --shadow-md could not reliably override a --shadow-sm bundled in
 * here. Each call site states its own elevation with one of the two constants
 * below. (Same split /hire arrived at; hoisted here so the six utility routes
 * share the definition instead of re-deriving it.)
 */
export const PANEL = "rounded-[var(--radius-md)] border border-border bg-surface p-6 sm:p-7";

/** Resting elevation for a supporting panel — present, not asserting. */
export const PANEL_REST = "shadow-[var(--shadow-sm)]";

/**
 * Clerk's measured card shadow (hairline ring + tight contact + wide soft drop).
 * Reserved for the panel a band actually exists to produce, so that depth still
 * carries information when it appears.
 */
export const PANEL_RAISED = "shadow-[var(--shadow-md)]";

/**
 * A framed figure — an image or product surface that must read as a deliberate
 * object rather than as a picture floating on the page. `radius-lg` (12px) is the
 * token for figures, one step above the 6px used by cards and controls.
 * `overflow-hidden` is load-bearing: without it a child image's square corners
 * paint over the frame's rounded ones.
 */
export const FIGURE =
  "overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-md)]";

/**
 * The small mono label that titles a group inside a band (Experience, Skills,
 * Built, Open to…). It is a STYLE, not a heading level — apply it to whatever
 * element the document outline actually calls for, so it never pollutes the
 * heading order.
 */
export const LABEL = "font-mono text-xs uppercase tracking-[0.06em] text-ink-tertiary";

/**
 * Entrance-stagger index for `.reveal-stagger > *` (globals.css), which derives
 * each child's delay as --i x --stagger-step.
 *
 * Typed as an intersection rather than cast: React's `CSSProperties` carries no
 * index signature for custom properties, and `as CSSProperties` on an object
 * holding one would silently accept a typo. Components pass an INDEX and never a
 * duration, which is what keeps Law 8 (no magic numbers) true for choreography.
 *
 * Motion: the whole stagger system lives inside a
 * `prefers-reduced-motion: no-preference` block in CSS, so passing an index
 * costs nothing and needs no per-component guard.
 */
export type StaggerStyle = import("react").CSSProperties & Record<"--i", number>;

/** Build the stagger style for the i-th child of a `.reveal-stagger` group. */
export function stagger(i: number): StaggerStyle {
  return { "--i": i };
}
