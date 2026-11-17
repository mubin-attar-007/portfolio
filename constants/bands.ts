/**
 * The geometry of a hairline-celled band — today the proof strip on /about
 * (`components/features/proof-strip.tsx`), a ruled grid of cells with identical
 * padding on both sides of every hairline, so the rules line up and the row
 * reads as one ruled block rather than as pasted-on strips.
 *
 * Why several rules instead of one: a divider's AXIS depends on how its cells are
 * laid out at that breakpoint, and the strip reflows at two widths (its stats
 * sit three across from `sm`; the employer cell joins them in one row from
 * `lg`). A single
 * responsive string would draw a horizontal rule between cells that are sitting
 * side by side. Each constant therefore names the layout it belongs to, and the
 * call site picks the one that matches its own breakpoints.
 *
 * Tailwind class strings rather than CSS custom properties: these are layout
 * decisions the components compose, and keeping them as classes means the spacing
 * still comes from the Tailwind scale (which is token-derived) rather than from a
 * hand-written length.
 */

/**
 * The band's row. Deliberately the same measure AND the same gutters as
 * `Container` (24px, 32px from `md`), because a full-bleed band whose first cell
 * starts 8px inside the section content above it reads as a misprint. The band
 * cannot literally use `Container` — it needs to be the flex row itself.
 */
export const BAND_ROW = "mx-auto w-full max-w-[var(--width-container)] px-6 md:px-8";

/**
 * A band cell: a fixed height plus generous side padding, so interior rules sit
 * in equal air. The cell at the row's LEADING edge drops its leading padding at
 * the call site so its text lines up with the page gutter rather than being
 * double-inset.
 */
export const BAND_CELL = "py-5 px-6";

/** Leading rule for cells that wrap into rows until `sm`, then sit in one row. */
export const BAND_RULE_SM = "border-t border-border sm:border-t-0 sm:border-l sm:border-border";

/** Leading rule for cells that stack until `lg`, then sit in a row. */
export const BAND_RULE_LG = "border-t border-border lg:border-t-0 lg:border-l lg:border-border";
