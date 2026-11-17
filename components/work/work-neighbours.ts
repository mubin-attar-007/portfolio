import { flagshipHref, flagshipNeighbours, flagships, type Flagship } from "@/content/flagship";
import { projectNeighbours, projects } from "@/content/projects";
import type { Project } from "@/content/schema";
import type { Neighbour } from "./neighbour-cards";

/**
 * The previous and next case studies around a page, in the site's order of
 * work: the flagships, then the public case studies. The last flagship leads on
 * to the first public one and the first public one back to the last flagship,
 * so the chain runs through every case study both ways. Shared by the flagship
 * routes (app/work/bench-discovery, app/work/careltc) and /work/[slug].
 */

/** A public case study as a previous/next card. */
const projectNeighbour = (p: Project): Neighbour => ({
  href: `/work/${p.slug}`,
  title: p.title,
  definition: p.card.definition,
  shot: p.card.shot,
});

/** A flagship case study as a previous/next card. */
const flagshipNeighbour = (f: Flagship): Neighbour => ({
  href: flagshipHref(f.slug),
  title: f.name,
  definition: f.definition,
  shot: f.hero.primary,
});

/** A flagship's neighbours: the other flagships, then the first public case study. */
export function flagshipNeighbourCards(flagship: Flagship): { previous: Neighbour | null; next: Neighbour | null } {
  const { previous, next } = flagshipNeighbours(flagship.slug);
  const firstPublic = [...projects].sort((a, b) => a.order - b.order)[0];
  return {
    previous: previous ? flagshipNeighbour(previous) : null,
    next: next ? flagshipNeighbour(next) : firstPublic ? projectNeighbour(firstPublic) : null,
  };
}

/** A public case study's neighbours: the first one leads back to the last flagship. */
export function projectNeighbourCards(slug: string): { previous: Neighbour | null; next: Neighbour | null } {
  const { previous, next } = projectNeighbours(slug);
  const lastFlagship = flagships.at(-1);
  return {
    previous: previous ? projectNeighbour(previous) : lastFlagship ? flagshipNeighbour(lastFlagship) : null,
    next: next ? projectNeighbour(next) : null,
  };
}
