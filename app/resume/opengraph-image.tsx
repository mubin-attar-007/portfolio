import { renderOg, OG_SIZE, OG_CONTENT_TYPE, formatOgEyebrow } from "@/lib/og";

export const alt = "Résumé — Mubin Attar, AI Software Engineer";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return renderOg({
    eyebrow: formatOgEyebrow("Résumé"),
    title: "Résumé",
    subtitle: "AI Software Engineer — experience, skills, and education.",
    footerRight: "/resume",
  });
}
