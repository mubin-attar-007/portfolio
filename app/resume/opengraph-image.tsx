import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Résumé — Mubin Attar, AI/ML Engineer";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return renderOg({
    eyebrow: "mubin attar · résumé",
    title: "Résumé",
    subtitle: "AI/ML Engineer — experience, skills, and education.",
    footerRight: "/resume",
  });
}
