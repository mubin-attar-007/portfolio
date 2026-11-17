import { renderOg, ogAlt, OG_SIZE, OG_CONTENT_TYPE, type OgCard } from "@/lib/og";
import { pages } from "@/content/site";
import { writingPage } from "@/content/pages/writing";

/** The headline is the /writing header (content/pages/writing.ts). */
const CARD = {
  kicker: pages.writing.kicker,
  title: writingPage.title,
  description: "Drawn from the decisions and failures in my projects.",
} satisfies OgCard;

export const alt = ogAlt(CARD);
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg(CARD);
}
