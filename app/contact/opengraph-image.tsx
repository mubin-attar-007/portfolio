import { renderOg, ogAlt, OG_SIZE, OG_CONTENT_TYPE, type OgCard } from "@/lib/og";

/**
 * The headline is the /contact page header (spec/prototype/contact.html); when
 * the page's copy module lands (content/pages/contact.ts), read it from there
 * instead. The line names the page's two routes: email for a role, a booked
 * call for a freelance project.
 */
const CARD = {
  kicker: "Contact",
  title: "Let's talk about what you're building",
  description: "Email me about a role, or book a call about a freelance project.",
} satisfies OgCard;

export const alt = ogAlt(CARD);
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg(CARD);
}
