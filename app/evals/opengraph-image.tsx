import { renderOg, ogAlt, OG_SIZE, OG_CONTENT_TYPE, type OgCard } from "@/lib/og";
import { evalsIntro } from "@/content/evals";

/**
 * /evals is a dark page, so its card is the dark plate. The line states the
 * registry's two rules: a figure carries its method, and a retired result keeps
 * its row with the reason (content/evals.ts).
 */
const CARD = {
  kicker: "Evaluations",
  title: evalsIntro.title,
  description: "Every figure links to its method. Retired results stay, with the reason.",
  tone: "dark",
} satisfies OgCard;

export const alt = ogAlt(CARD);
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg(CARD);
}
