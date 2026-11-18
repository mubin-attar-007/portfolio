import { renderOg, ogAlt, OG_SIZE, OG_CONTENT_TYPE, type OgCard } from "@/lib/og";
import { trust } from "@/content/site";

const CARD = {
  kicker: trust.kicker,
  title: trust.title,
  description: "Every item links to a source you can check.",
} satisfies OgCard;

export const alt = ogAlt(CARD);
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg(CARD);
}
