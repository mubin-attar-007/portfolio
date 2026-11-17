/**
 * Search-result limits for page titles and descriptions — one source for the
 * pages (lib/seo.ts, lib/excerpt.ts, content/schema.ts) and for the metadata
 * gate (scripts/lighthouse-budget.mjs), which imports this file with plain
 * Node. Keep it free of imports and of type-only syntax Node cannot strip.
 *
 * - `titleMax` 60: a results page shows about 60 characters of a title. Past
 *   that, `documentTitle` drops the " · Mubin Attar" suffix rather than let the
 *   page's own name be cut.
 * - `descriptionMax` 160: snippets show about 155–160 characters.
 * - `descriptionMin` 50: shorter is almost always a template or a stub — the
 *   notes once shipped "A short note on evals, sql." (27) on every page.
 */
export const SEO_LIMITS = {
  titleMax: 60,
  descriptionMin: 50,
  descriptionMax: 160,
} as const;
