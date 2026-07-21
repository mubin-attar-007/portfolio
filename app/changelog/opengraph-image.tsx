import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Changelog — Mubin Attar, AI/ML engineer";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return renderOg({
    eyebrow: "mubin attar · changelog",
    title: "Changelog: product and engineering updates",
    subtitle: "A public timeline of what changed, when, and why.",
    footerRight: "/changelog",
  });
}
