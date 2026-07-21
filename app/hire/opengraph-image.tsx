import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Hire — Mubin Attar, AI/ML engineer";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return renderOg({
    eyebrow: "mubin attar · hire",
    title: "Hire me",
    subtitle: "Clear process, real delivery evidence, and a direct path to start a conversation.",
    footerRight: "/hire",
  });
}
