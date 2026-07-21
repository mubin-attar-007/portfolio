/**
 * Shared metrics for the page's two hairline-celled bands — the proof strip and
 * the stack band — which sit directly on top of each other under the hero.
 *
 * They exist because "read as one system" has to be enforced by a single source,
 * not by two files that happen to agree today. Clerk's trust row is a ruled grid
 * of cells with identical padding on both sides of every hairline; the moment one
 * band pads its cells differently from its neighbour, the two rules stop lining
 * up and the pair reads as two pasted-on strips instead of one ruled block.
 *
 * Why several rules instead of one: a divider's AXIS depends on how its cells are
 * laid out at that breakpoint, and the two bands reflow at different widths (the
 * stack band is a row from `sm`, the proof strip only from `lg`). A single
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
 * Cell height. This — not the horizontal padding — is what actually makes the two
 * bands read as one block: they are stacked vertically, so a reader compares
 * their ROW heights and the position of the hairline between them. Every cell in
 * either band spends this.
 */
export const BAND_CELL_Y = "py-5";

/**
 * A full band cell: the shared height plus generous side padding, so interior
 * rules sit in equal air. The cell at the row's LEADING edge drops its leading
 * padding at the call site so its text lines up with the page gutter rather than
 * being double-inset.
 *
 * Cells that tile many-across (the stack band packs six into one row) compose
 * BAND_CELL_Y with a tighter inline padding instead — 24px a side is the right
 * measure for three wide cells and overflows the container at six.
 */
export const BAND_CELL = `${BAND_CELL_Y} px-6`;

/** Leading rule for cells that wrap into rows until `sm`, then sit in one row. */
export const BAND_RULE_SM = "border-t border-border sm:border-t-0 sm:border-l sm:border-border";

/** Leading rule for cells that stack until `lg`, then sit in a row. */
export const BAND_RULE_LG = "border-t border-border lg:border-t-0 lg:border-l lg:border-border";

/**
 * TRAILING rule, drawn only once the band is a row (`sm`+).
 *
 * Needed where the element AFTER this one is masked — a mask erases the masked
 * element's own border along with its content, so a leading rule on that side
 * would simply not paint. Deliberately absent below `sm`: there the next element
 * already draws its own leading rule, and two would stack into a 2px hairline.
 */
export const BAND_RULE_SM_AFTER = "sm:border-r sm:border-border";
