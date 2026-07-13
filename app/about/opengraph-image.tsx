import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "About — Mubin Attar, AI/ML engineer";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return renderOg({
    eyebrow: "mubin attar · about",
    title: "Solo engineer, real products.",
    subtitle: "Who I am, what I build, and the one rule across all of it.",
    footerRight: "/about",
  });
}
