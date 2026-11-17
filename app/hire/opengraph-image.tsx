import { renderOg, OG_SIZE, OG_CONTENT_TYPE, formatOgEyebrow } from "@/lib/og";
import { SITE } from "@/config/site";

export const alt = `Hire — ${SITE.name}, ${SITE.role}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return renderOg({
    eyebrow: formatOgEyebrow("Hire"),
    title: "Hire me",
    subtitle: "Clear process, real delivery evidence, and a direct path to start a conversation.",
    footerRight: "/hire",
  });
}
