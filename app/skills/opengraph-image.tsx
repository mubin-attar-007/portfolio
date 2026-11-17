import { renderOg, ogAlt, OG_SIZE, OG_CONTENT_TYPE, type OgCard } from "@/lib/og";

/**
 * The page is titled "Skills", which the kicker already says, so the card's
 * title is the page's own description of itself: a stack map.
 */
const CARD = {
  kicker: "Skills",
  title: "A practical stack map for production AI systems",
  description: "Languages, models, data layers and the safety practices around them.",
} satisfies OgCard;

export const alt = ogAlt(CARD);
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg(CARD);
}
