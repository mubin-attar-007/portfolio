import { renderOg, ogAlt, OG_SIZE, OG_CONTENT_TYPE, type OgCard } from "@/lib/og";
import { SITE } from "@/config/site";
import { resume } from "@/content/resume";

/**
 * The brand row already names the person, so the title is the role the
 * résumé is written for.
 */
const CARD = {
  kicker: resume.kicker,
  title: SITE.role,
  description: "Experience, projects with their methods, skills and education.",
} satisfies OgCard;

export const alt = ogAlt(CARD);
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg(CARD);
}
