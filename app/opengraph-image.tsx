import { renderOg, OG_SIZE, OG_CONTENT_TYPE, formatOgEyebrow } from "@/lib/og";
import { SITE } from "@/config/site";

const TITLE = "I build grounded AI systems — and show how they actually work.";

/** Describes the card as it prints: the name, the role, and its one sentence. */
export const alt = `${SITE.name}, ${SITE.role}: ${TITLE}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return renderOg({
    eyebrow: formatOgEyebrow(SITE.role),
    title: TITLE,
    subtitle: "Four shipped products. Real architecture, real numbers, every metric linked to its method.",
    footerRight: SITE.url.replace(/^https?:\/\//, ""),
  });
}
