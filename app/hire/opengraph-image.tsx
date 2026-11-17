import { renderOg, ogAlt, OG_SIZE, OG_CONTENT_TYPE, type OgCard } from "@/lib/og";
import { STATUS } from "@/config/site";
import { hirePage } from "@/content/pages/hire";

/**
 * The headline is the /hire h1 with its accent (content/pages/hire.ts); the
 * line is the site's availability sentence, single-sourced in STATUS.
 */
const CARD = {
  kicker: "Hire me",
  title: `${hirePage.hero.title} ${hirePage.hero.accent}`,
  description: STATUS.text,
} satisfies OgCard;

export const alt = ogAlt(CARD);
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg(CARD);
}
