import { benchDiscovery } from "./bench-discovery";
import { careltc } from "./careltc";
import { signflow } from "./signflow";
import type { Flagship, FlagshipSlug, Screenshot } from "./types";

export type { Flagship, FlagshipSlug } from "./types";

/**
 * The flagship case studies, in the order the site shows them: the Work menu,
 * the work sub-nav, /work, the home page and the sitemap. All three are published.
 */
export const flagships: readonly Flagship[] = [benchDiscovery, careltc, signflow];

/** A lookup by `find`, so an object key like "constructor" is never a product. */
export const flagshipBySlug = (slug: string): Flagship | undefined => flagships.find((f) => f.slug === slug);

/** True for a slug of a flagship case study (narrows the type). */
export const isFlagshipSlug = (slug: string): slug is FlagshipSlug => flagships.some((f) => f.slug === slug);

/** A flagship's page. */
export const flagshipHref = (slug: FlagshipSlug): string => `/work/${slug}`;

/**
 * One of a flagship's captures by its file's name ("web-review"), from its hero
 * pair or its gallery: the home page's showcase places captures by name.
 * Throws on a name the flagship does not have, so a renamed capture fails the
 * build instead of leaving a hole on the stage.
 */
export function flagshipCapture(flagship: Flagship, name: string): Screenshot {
  const shots = [flagship.hero.primary, flagship.hero.secondary, ...flagship.gallery.flatMap((tab) => tab.shots)];
  const shot = shots.find((s) => s.src.endsWith(`/${name}.webp`));
  if (!shot) throw new Error(`${flagship.slug}: no capture named "${name}"`);
  return shot;
}

/** The case study before and after this one, in the site's order of work. */
export function flagshipNeighbours(slug: FlagshipSlug): { previous: Flagship | null; next: Flagship | null } {
  const index = flagships.findIndex((f) => f.slug === slug);
  return { previous: flagships[index - 1] ?? null, next: flagships[index + 1] ?? null };
}
