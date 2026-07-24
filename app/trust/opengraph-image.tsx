import { renderOg, OG_SIZE, OG_CONTENT_TYPE, formatOgEyebrow } from "@/lib/og";

export const alt = "Trust — Mubin Attar, AI Software Engineer";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return renderOg({
    eyebrow: formatOgEyebrow("Trust & Quality"),
    title: "I publish what ships and what changes.",
    subtitle:
      "Evidence-first trust, deterministic safety controls, and reliable release practice for production AI systems.",
    footerRight: "/trust",
  });
}
