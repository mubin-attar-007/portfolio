import { renderOg, ogAlt, OG_SIZE, OG_CONTENT_TYPE, type OgCard } from "@/lib/og";
import { SITE } from "@/config/site";
import { projects } from "@/content/projects";
import { HERO } from "@/content/pages/home";

/**
 * The homepage card: the role, the hero's headline, and the facts line.
 *
 * The headline is the hero's h1 (content/pages/home.ts). The public-system
 * count comes from the project registry.
 */
const CARD = {
  kicker: SITE.role,
  title: HERO.title,
  description: ["2 field systems", `${projects.length} public systems`, SITE.location].join(" · "),
} satisfies OgCard;

export const alt = ogAlt(CARD);
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg(CARD);
}
