import { renderOg, OG_SIZE, OG_CONTENT_TYPE, formatOgEyebrow } from "@/lib/og";
import { SITE } from "@/config/site";

export const alt = `Résumé — ${SITE.name}, ${SITE.role}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return renderOg({
    eyebrow: formatOgEyebrow("Résumé"),
    title: "Résumé",
    subtitle: `${SITE.role} — experience, featured projects, skills, and education.`,
    footerRight: "/resume",
  });
}
