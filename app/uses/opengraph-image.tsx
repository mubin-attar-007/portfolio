import { renderOg, ogAlt, OG_SIZE, OG_CONTENT_TYPE, type OgCard } from "@/lib/og";
import { uses } from "@/content/site";

/** The line is the opening sentence of the page's own intro (`uses.intro`), read from it. */
const CARD = {
  kicker: uses.kicker,
  title: uses.title,
  description: uses.intro.slice(0, uses.intro.indexOf(".") + 1),
} satisfies OgCard;

export const alt = ogAlt(CARD);
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg(CARD);
}
