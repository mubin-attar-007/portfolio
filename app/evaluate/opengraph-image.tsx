import { renderOg, ogAlt, OG_SIZE, OG_CONTENT_TYPE, type OgCard } from "@/lib/og";
import { SITE } from "@/config/site";
import { evaluatePage } from "@/content/pages/evaluate";

/** /evaluate is a dark page, so its card is the dark plate. */
const CARD = {
  kicker: "llms.txt",
  title: evaluatePage.hero.title,
  description: `${SITE.name} · ${SITE.role}`,
  tone: "dark",
} satisfies OgCard;

export const alt = ogAlt(CARD);
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg(CARD);
}
