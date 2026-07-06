import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { SITE } from "@/config/site";

export const alt = "Mubin Attar — AI/ML Engineer building grounded AI systems";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return renderOg({
    eyebrow: "mubin attar · ai/ml engineer",
    title: "I build grounded AI systems — and show how they actually work.",
    subtitle: "Four live products. Real architecture, real numbers, every metric linked to its method.",
    footerRight: SITE.url.replace(/^https?:\/\//, ""),
  });
}
