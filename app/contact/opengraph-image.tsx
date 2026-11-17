import { renderOg, ogAlt, OG_SIZE, OG_CONTENT_TYPE, type OgCard } from "@/lib/og";
import { contactPage } from "@/content/pages/contact";

/**
 * The kicker and headline are the /contact page header
 * (content/pages/contact.ts). The line names the page's two routes: email for a role, a booked
 * call for a freelance project.
 */
const CARD = {
  kicker: contactPage.header.kicker,
  title: contactPage.header.title,
  description: "Email me about a role, or book a call about a freelance project.",
} satisfies OgCard;

export const alt = ogAlt(CARD);
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg(CARD);
}
