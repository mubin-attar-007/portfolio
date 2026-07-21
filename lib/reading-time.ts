/**
 * Reading-time estimation for MDX bodies. Pure functions, no React, no I/O —
 * tested in test/reading-time.test.mts.
 *
 * This is an ESTIMATE and the UI says so ("~4 min read"). It is not a metric
 * about my work, so it carries no method footnote; the method is nonetheless
 * documented here rather than hidden behind a magic number.
 */

/**
 * 220 words per minute. The commonly cited silent-reading range for adults on
 * technical material is roughly 200–250 wpm; 220 sits mid-range. Named rather
 * than inlined so the assumption is visible and adjustable in one place.
 */
const WORDS_PER_MINUTE = 220;

/** Shortest estimate we will display. A 40-word note is still "1 min", not "0 min". */
const MIN_MINUTES = 1;

/**
 * Strip everything that is not prose a human reads at prose speed.
 *
 * Order matters: frontmatter and fenced code go first because their contents
 * can contain any other syntax, so removing them shrinks the problem before the
 * narrower rules run. Code is removed entirely rather than counted — a reader
 * scans a snippet at a completely different rate than a sentence, so counting
 * its tokens as words inflates the estimate badly on this site, where posts are
 * code-heavy by design.
 */
function stripToProse(source: string): string {
  return (
    source
      // YAML frontmatter block at the very top of the file.
      .replace(/^---\r?\n[\s\S]*?\r?\n---/, " ")
      // Fenced code blocks, including the language tag.
      .replace(/```[\s\S]*?```/g, " ")
      // Inline code spans.
      .replace(/`[^`]*`/g, " ")
      // JSX/HTML tags and self-closing components — the tag, not its children,
      // so the prose inside <Callout>…</Callout> is still counted.
      .replace(/<\/?[A-Za-z][^>]*>/g, " ")
      // Markdown link/image syntax: keep the visible label, drop the target.
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      // Leftover markup punctuation that would otherwise split one word in two.
      .replace(/[#>*_~|]/g, " ")
  );
}

/** Count the prose words in an MDX source string. */
export function countWords(source: string): number {
  const prose = stripToProse(source).trim();
  if (prose === "") return 0;
  return prose.split(/\s+/).length;
}

/**
 * Estimated reading time in whole minutes, floored at 1 for any non-empty body.
 * An empty body returns 0 so a caller can choose to render nothing at all.
 */
export function readingMinutes(source: string): number {
  const words = countWords(source);
  if (words === 0) return 0;
  return Math.max(MIN_MINUTES, Math.round(words / WORDS_PER_MINUTE));
}
