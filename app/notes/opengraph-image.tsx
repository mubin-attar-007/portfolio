import { renderOg, ogAlt, OG_SIZE, OG_CONTENT_TYPE, type OgCard } from "@/lib/og";
import { pages } from "@/content/site";

const CARD = {
  kicker: pages.notes.kicker,
  title: pages.notes.title,
  description: "Short notes on retrieval, evaluation, agents and infrastructure.",
} satisfies OgCard;

export const alt = ogAlt(CARD);
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg(CARD);
}
