import { SEO_LIMITS } from "@/constants/seo";

/**
 * Plain-text excerpts of MDX bodies, for search, social and feed descriptions.
 * Pure functions, no I/O — tested in test/seo.test.mts.
 *
 * A description is the author's own words, cut where a sentence ends. It is
 * never assembled from metadata: the notes once described themselves as "A
 * short note on evals, sql." on every page, in every feed item, and in their
 * structured data.
 */

/**
 * Blocks that are not a prose paragraph: headings, JSX and MDX expressions,
 * imports and exports, quotes, lists, fenced code, tables, and images.
 */
const NON_PROSE_BLOCK = /^(?:#|<|\{|import\s|export\s|>|[-*+]\s|\d+[.)]\s|```|~~~|\||!\[)/;

/**
 * Where one sentence ends and the next begins: `.`, `!` or `?` (after any
 * closing quote or bracket), whitespace, then a capital, a digit, or an opening
 * quote. A `?` inside a quoted phrase followed by a lowercase word ("…own this
 * row?" is the route handler) is therefore not a boundary.
 */
const SENTENCE_BOUNDARY = /(?<=[.!?]["'”’)\]]*)\s+(?=["'“‘(]?[A-Z0-9])/;

/** Trailing characters a cut must not end on: spaces, joiners, an opened bracket. */
const DANGLING = /[\s,;:—–\-(]+$/;

/** Inline markdown reduced to the words a reader sees. */
function toPlainText(markdown: string): string {
  return (
    markdown
      // Links and images keep their visible label.
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      // Code spans keep their text: an identifier is part of the sentence.
      .replace(/`([^`]*)`/g, "$1")
      .replace(/(\*\*|__)(.+?)\1/g, "$2")
      // Emphasis opens after a non-word character, so the underscore inside
      // `snake_case` is left alone.
      .replace(/(^|[^\w*])[*_]([^*_\n]+)[*_](?=[^\w*]|$)/g, "$1$2")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * The first prose paragraph of an MDX source, as plain text: the frontmatter
 * is skipped, and links, emphasis and code marks are reduced to their words.
 * Empty when the body has no prose paragraph.
 */
export function firstParagraph(source: string): string {
  const body = source
    .replace(/\r\n?/g, "\n")
    .replace(/^---\n[\s\S]*?\n---[ \t]*(?:\n|$)/, "");
  const block = body
    .split(/\n[ \t]*\n/)
    .map((candidate) => candidate.trim())
    .find((candidate) => candidate !== "" && !NON_PROSE_BLOCK.test(candidate));
  return block ? toPlainText(block) : "";
}

/**
 * Fit text into a description of at most `max` characters: as many whole
 * sentences as fit. When those would be shorter than the useful minimum (one
 * long opening sentence), the words that fit, ending in "…".
 *
 * @param text plain text (see `firstParagraph`)
 * @param max  the character limit; defaults to the search-snippet limit
 */
export function fitDescription(text: string, max: number = SEO_LIMITS.descriptionMax): string {
  if (text.length <= max) return text;

  let fitted = "";
  for (const sentence of text.split(SENTENCE_BOUNDARY)) {
    const next = fitted ? `${fitted} ${sentence}` : sentence;
    if (next.length > max) break;
    fitted = next;
  }
  if (fitted.length >= SEO_LIMITS.descriptionMin) return fitted;

  const room = text.slice(0, max - 1);
  const words = room.slice(0, Math.max(room.lastIndexOf(" "), 0)) || room;
  return `${words.replace(DANGLING, "")}…`;
}
