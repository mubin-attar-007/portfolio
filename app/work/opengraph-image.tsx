import { renderOg, ogAlt, OG_SIZE, OG_CONTENT_TYPE, type OgCard } from "@/lib/og";
import { pages } from "@/content/site";
import { projects } from "@/content/projects";

/** The work index: its title, and the public systems it holds, by name. */
const CARD = {
  kicker: "Work",
  title: pages.work.title,
  description: projects.map((project) => project.title).join(" · "),
} satisfies OgCard;

export const alt = ogAlt(CARD);
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg(CARD);
}
