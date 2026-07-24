import { renderOg, OG_SIZE, OG_CONTENT_TYPE, formatOgEyebrow } from "@/lib/og";

export const alt = "About — Mubin Attar, AI Software Engineer";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return renderOg({
    eyebrow: formatOgEyebrow("About"),
    title: "Solo engineer, real products.",
    subtitle: "Who I am, what I build, and the one rule across all of it.",
    footerRight: "/about",
  });
}
