import { renderOg, ogAlt, OG_SIZE, OG_CONTENT_TYPE, type OgCard } from "@/lib/og";
import { pages } from "@/content/site";
import { flagships } from "@/content/flagship";
import { projects } from "@/content/projects";

/** The work index: its title, and every system it holds, by name, the flagships first. */
const CARD = {
  kicker: "Work",
  title: pages.work.title,
  description: [...flagships.map((flagship) => flagship.name), ...projects.map((project) => project.title)].join(" · "),
} satisfies OgCard;

export const alt = ogAlt(CARD);
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg(CARD);
}
