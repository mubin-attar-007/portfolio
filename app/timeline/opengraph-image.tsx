import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Timeline — Mubin Attar";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return renderOg({
    eyebrow: "mubin attar · timeline",
    title: "Built, learned, got wrong, changed.",
    subtitle: "The engineering timeline — phase by phase.",
    footerRight: "/timeline",
  });
}
