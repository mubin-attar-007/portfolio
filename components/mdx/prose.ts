/**
 * PROSE — the ONE typographic scale for long-form reading, shared by every
 * article surface on the site.
 *
 * Why this file exists: an article can reach the screen down two independent
 * paths. MDX bodies (writing, notes) render through `mdxComponents`; case-study
 * bodies are hand-authored React that renders through `<CS>`. Both were styling
 * headings and paragraphs with their own literal class strings, so an `h2` in a
 * case study and an `h2` in an essay were different sizes with different space
 * above them — the most visible inconsistency inside the reading experience,
 * and the one a hiring manager hits first because case studies are the pages
 * they actually read.
 *
 * Both paths now import these constants. Retuning the reading rhythm is a
 * one-file change and the two paths CANNOT drift, because there is no longer a
 * second place to edit.
 *
 * Rules encoded here:
 * - MEASURE lives on the element, not on the container. An MDX body already sits
 *   in a 68ch column so `max-w` is a no-op there; a case-study body spans the
 *   full container so wide evidence (diagrams, logs, tables) can breathe, and
 *   the measure has to be re-imposed per block. Putting it on the block is the
 *   only way both paths land on the same line length.
 * - Space is applied ABOVE a block (`mt-`), never below, so blocks compose
 *   without collapsing-margin surprises. Headings are the one exception: they
 *   own the gap to their own body copy (`mb-`), which is what visually binds a
 *   heading to the text it introduces rather than letting it float mid-gap.
 * - Evidence blocks (figures, code, quotes) share ONE vertical rhythm (`my-8`)
 *   so a reader scanning the page sees a single cadence, not three.
 *
 * A11y: `SCROLL_MARGIN` keeps an anchored heading clear of the sticky header
 * when a deep link or a skip target moves focus to it — without it the heading
 * lands underneath the header and a keyboard user appears to jump nowhere.
 * In-prose links are underlined AT REST (`LINK`), never colour-only: a
 * colour-only in-prose link has already failed this repo's a11y gate once
 * (WCAG 1.4.1 Use of Colour).
 */

/** Keeps `id`-anchored headings below the sticky header when jumped to. */
const SCROLL_MARGIN = "scroll-mt-24";

/** The reading measure. Restated per block — see the note above on why. */
const MEASURE = "max-w-[var(--width-prose)]";

export const PROSE = {
  /**
   * Section heading. The size token (`text-2xl`) already carries its own
   * line-height and -0.015em tracking, so neither is restated — a hand-typed
   * tracking value here is exactly how the two paths drifted apart before.
   */
  h2: `mt-14 mb-4 ${SCROLL_MARGIN} ${MEASURE} text-2xl text-ink`,

  /** Sub-heading inside a section. */
  h3: `mt-10 mb-3 ${SCROLL_MARGIN} ${MEASURE} text-xl text-ink`,

  /** Body paragraph — the baseline everything else is tuned against. */
  p: `mt-4 ${MEASURE} leading-[1.75] text-ink-secondary`,

  /** Lists share the paragraph's leading so a list doesn't read tighter than the text around it. */
  ul: `mt-4 ${MEASURE} list-disc space-y-2 pl-5 marker:text-ink-tertiary`,
  ol: `mt-4 ${MEASURE} list-decimal space-y-2 pl-5 marker:text-ink-tertiary`,
  li: "pl-1 leading-[1.75] text-ink-secondary",

  /**
   * A plain markdown `>` quote. Shares the evidence rhythm (my-6) and the
   * --stripe-width left rule used by Callout, so it reads as part of the same
   * system; the dramatic serif treatment is reserved for the `<PullQuote>`
   * device, which an author opts into explicitly.
   */
  blockquote: `my-6 ${MEASURE} border-l-[length:var(--stripe-width)] border-border-strong pl-5 italic text-ink-secondary`,

  /**
   * In-prose link. Underlined at rest in a quiet hairline colour that warms to
   * the accent on hover, so the link is discoverable without colour AND the
   * underline still reads as deliberate rather than as a browser default.
   */
  link: "text-ink underline decoration-border-strong underline-offset-4 transition-colors duration-fast ease-[var(--ease-out)] hover:decoration-accent",

  /**
   * Inline code — a quiet filled chip, no border. Mid-sentence, a hairline
   * around every span reads as noise in code-heavy prose, so this stays
   * fill-only; the framed treatment is for block code (CodeBlock), not inline.
   */
  code: "rounded-[var(--radius-sm)] bg-bg-subtle px-1.5 py-0.5 font-mono text-[0.85em] text-ink",

  /** Emphasis that carries meaning — never colour alone. */
  strong: "font-medium text-ink",

  /** A real topic break, spaced wider than any block so it reads as a division. */
  hr: `my-12 ${MEASURE} border-border`,
} as const;

/**
 * The shared evidence-block rhythm (figures, code blocks, decision/failure
 * logs). One constant so these blocks can't drift apart — before, each carried
 * its own literal `my-6` and a change to one would have silently desynced them.
 *
 * Value note: `my-6`, deliberately NOT wider. In an MDX body these blocks sit in
 * normal flow where the margin collapses cleanly; in a case-study body they sit
 * in `CS`'s flex column, where a flex gap and item margins COMPOUND rather than
 * collapse. A larger value here would balloon the gaps between two adjacent
 * figures in a case study without touching the MDX path — so the modest value
 * is what keeps the two reading surfaces close, not far apart.
 */
export const EVIDENCE_SPACING = "my-6";

/** The shared evidence-block frame: hairline, large radius, quiet lift. */
export const EVIDENCE_FRAME =
  "overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-sm)]";
