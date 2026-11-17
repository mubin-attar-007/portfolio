import { renderOg, ogAlt, OG_SIZE, OG_CONTENT_TYPE, type OgCard } from "@/lib/og";
import { STATUS } from "@/config/site";

/**
 * The headline is the redesigned /hire h1 (spec/prototype/hire.html); when the
 * page's copy module lands (content/pages/hire.ts), read it from there instead.
 * The line is the site's availability sentence, single-sourced in STATUS.
 */
const CARD = {
  kicker: "Hire me",
  title: "I turn customer problems into running systems inside their rules",
  description: STATUS.text,
} satisfies OgCard;

export const alt = ogAlt(CARD);
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg(CARD);
}
