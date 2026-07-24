import { renderOg, OG_SIZE, OG_CONTENT_TYPE, formatOgEyebrow } from "@/lib/og";

export const alt = "Skills — Mubin Attar";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return renderOg({
    eyebrow: formatOgEyebrow("Skills"),
    title: "Skills",
    subtitle: "Technologies, LLM methods, and engineering practices used across four live AI systems.",
    footerRight: "/skills",
  });
}

