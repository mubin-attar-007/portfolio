import { renderOg, ogAlt, OG_SIZE, OG_CONTENT_TYPE, type OgCard } from "@/lib/og";
import { SITE } from "@/config/site";
import { projects } from "@/content/projects";

/**
 * The homepage card: the role, the hero's headline, and the facts line.
 *
 * The headline is the redesigned hero's approved h1 (spec/prototype/index.html).
 * When the homepage's copy module lands (content/pages/home.ts), read it from
 * there instead. The public-system count comes from the project registry.
 */
const CARD = {
  kicker: SITE.role,
  title: "I ship AI and software inside the customer's rules",
  description: ["2 field systems", `${projects.length} public systems`, SITE.location].join(" · "),
} satisfies OgCard;

export const alt = ogAlt(CARD);
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg(CARD);
}
