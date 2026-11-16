import { renderOg, OG_SIZE, OG_CONTENT_TYPE, formatOgEyebrow } from "@/lib/og";
import { SITE } from "@/config/site";

export const alt = `About — ${SITE.name}, ${SITE.role}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return renderOg({
    eyebrow: formatOgEyebrow("About"),
    title: "Solo engineer, real products.",
    subtitle: "Who I am, what I build, and the principles behind it.",
    footerRight: "/about",
  });
}
