import { renderOg, ogAlt, OG_SIZE, OG_CONTENT_TYPE, type OgCard } from "@/lib/og";
import { nowPage } from "@/content/site";

const CARD = {
  kicker: nowPage.kicker,
  title: nowPage.title,
  description: "What I'm building, exploring and reading, updated by hand.",
} satisfies OgCard;

export const alt = ogAlt(CARD);
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg(CARD);
}
