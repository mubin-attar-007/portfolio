import { renderOg, ogAlt, OG_SIZE, OG_CONTENT_TYPE, type OgCard } from "@/lib/og";
import { pages } from "@/content/site";

/**
 * The headline is the redesigned /writing header (spec/prototype/writing.html),
 * which names all three kinds in the index; when the page states it in a copy
 * module, read it from there instead.
 */
const CARD = {
  kicker: pages.writing.kicker,
  title: "Essays, guides and notes",
  description: "Drawn from the decisions and failures in my projects.",
} satisfies OgCard;

export const alt = ogAlt(CARD);
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg(CARD);
}
