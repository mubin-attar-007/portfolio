/**
 * The shared page-opening TOP. Every route starts the same distance below the
 * nav, so a visitor arriving on /notes reads the same object they read on /work
 * — an article opening 64px lower than its own index is exactly the seam that
 * makes a site read as two templates bolted together.
 *
 * Use ALONE on a single-band page (an article, /hire) whose one `Section` also
 * carries the page's close: that keeps the band's own asymmetric bottom instead
 * of ending the page on a thin header seam.
 *
 * `!` prefix: `Section` writes its own `pt` from the SPACE map, and this is the
 * deliberate override at the call site.
 */
export const PAGE_TOP = "!pt-[clamp(3.5rem,5vw,5rem)]";

/**
 * The opening band of a page — the one place the site decides how much air sits
 * above an h1 and below its lede.
 *
 * Why a constant rather than a `space` prop: `Section`'s scale is tuned for BODY
 * bands, where the asymmetric pair is what closes a section off as a finished
 * plate. A page header is not a finished plate — its content continues in the
 * very next band — so it takes the shared top and then only HALF the seam below
 * (`xs`); the body band underneath spends the other half. Every gap on the page
 * stays the sum of two tokens, so the rhythm can be reasoned about from
 * tokens.css rather than measured in a browser.
 */
export const PAGE_HEADER_BAND = `${PAGE_TOP} !pb-[var(--space-section-xs)]`;

/**
 * The body band directly under a page header — the other half of the pair above.
 *
 * Its top padding is pulled to `xs` because the header band already spent the
 * first half of the seam; anything heavier re-opens the void this exists to
 * close. The BOTTOM is left at the band's own asymmetric end, because this band
 * usually IS the end of the page and that heavier close is what makes it read as
 * finished rather than as content trailing into the footer.
 */
export const PAGE_BODY_BAND = "!pt-[var(--space-section-xs)]";

/**
 * One panel treatment for the whole site: surface fill, hairline ring, the
 * layered product-surface depth, `radius-md`.
 *
 * The inset top highlight inside `--shadow-surface` is the load-bearing part on
 * a light page: without it a white panel on a near-white ground reads as a flat
 * rectangle no matter how much drop shadow it carries.
 */
export const PANEL =
  "rounded-[var(--radius-md)] border border-border bg-surface p-6 shadow-[var(--shadow-surface)] sm:p-7";

/**
 * A framed figure — an image or product surface that must read as a deliberate
 * object rather than a picture floating on the page. `radius-lg` is the figure
 * token. `overflow-hidden` is load-bearing: without it a child image's square
 * corners paint over the frame's rounded ones.
 */
export const FIGURE =
  "overflow-hidden rounded-[var(--radius-xl)] bg-surface shadow-[var(--shadow-surface)]";

/**
 * The small mono label that titles a group inside a band (Experience, Skills,
 * Built, Open to…). It is a STYLE, not a heading level — apply it to whatever
 * element the document outline actually calls for, so it never pollutes the
 * heading order.
 */
export const LABEL =
  "font-mono text-xs uppercase tracking-[0.07em] text-ink-tertiary";

/**
 * Entrance-stagger index for `.reveal-stagger > *` and `[data-reveal]`
 * (globals.css), which derive each child's delay as --i × --stagger-step.
 *
 * Typed as an intersection rather than cast: React's `CSSProperties` carries no
 * index signature for custom properties, and `as CSSProperties` on an object
 * holding one would silently accept a typo. Components pass an INDEX and never a
 * duration, which is what keeps "no magic numbers" true for choreography.
 *
 * Motion: the whole stagger system lives inside a
 * `prefers-reduced-motion: no-preference` block, so passing an index costs
 * nothing and needs no per-component guard.
 */
export type StaggerStyle = import("react").CSSProperties & Record<"--i", number>;

/** Build the stagger style for the i-th child of a staggered group. */
export function stagger(i: number): StaggerStyle {
  return { "--i": i };
}
