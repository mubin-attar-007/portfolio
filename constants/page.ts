/**
 * The shared page-opening TOP. Every route starts the same distance below the
 * nav, so a visitor arriving on /notes reads the same object they read on /work
 * — an article opening 64px lower than its own index is exactly the seam that
 * makes a site read as two templates bolted together.
 *
 * Use ALONE on a single-band page (an article, /now, /resume) whose one
 * `Section` also carries the page's close: that keeps the band's own asymmetric
 * bottom instead of ending the page on a thin header seam.
 *
 * `!` prefix: `Section` writes its own `pt` from the SPACE map, and this is the
 * deliberate override at the call site.
 */
export const PAGE_TOP = "!pt-[clamp(3.5rem,5vw,5rem)]";
