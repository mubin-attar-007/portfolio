import { renderOg, ogAlt, OG_SIZE, OG_CONTENT_TYPE, type OgCard } from "@/lib/og";
import { uses } from "@/content/site";

/** The line is the opening of the page's own intro (`uses.intro`). */
const CARD = {
  kicker: uses.kicker,
  title: uses.title,
  description: "The tools behind the projects, from model integration to deployment.",
} satisfies OgCard;

export const alt = ogAlt(CARD);
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg(CARD);
}
