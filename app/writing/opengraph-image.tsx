import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Writing — Mubin Attar";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return renderOg({
    eyebrow: "mubin attar · writing",
    title: "Writing",
    subtitle: "Essays and guides on AI systems, evaluation, and honest ML.",
    footerRight: "/writing",
  });
}
