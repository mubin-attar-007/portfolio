import { benchDiscovery } from "./bench-discovery";
import { careltc } from "./careltc";
import type { Flagship, FlagshipSlug } from "./types";

export type { Flagship, FlagshipSlug } from "./types";

/**
 * The flagship case studies, in the order the site shows them: the Work menu,
 * the work sub-nav, /work, the home page and the sitemap. Both are published.
 */
export const flagships: readonly Flagship[] = [benchDiscovery, careltc];

/** A lookup by `find`, so an object key like "constructor" is never a product. */
export const flagshipBySlug = (slug: string): Flagship | undefined => flagships.find((f) => f.slug === slug);

/** True for a slug of a flagship case study (narrows the type). */
export const isFlagshipSlug = (slug: string): slug is FlagshipSlug => flagships.some((f) => f.slug === slug);

/** A flagship's page. */
export const flagshipHref = (slug: FlagshipSlug): string => `/work/${slug}`;

/** The case study before and after this one, in the site's order of work. */
export function flagshipNeighbours(slug: FlagshipSlug): { previous: Flagship | null; next: Flagship | null } {
  const index = flagships.findIndex((f) => f.slug === slug);
  return { previous: flagships[index - 1] ?? null, next: flagships[index + 1] ?? null };
}
