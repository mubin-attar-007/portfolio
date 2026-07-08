import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Hire Mubin Attar — AI/ML engineer";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return renderOg({
    eyebrow: "mubin attar · hire me",
    title: "Let's build something honest.",
    subtitle: "Open to AI/ML roles — remote or Ahmedabad, India. I design, build, ship, and maintain.",
    footerRight: "/hire",
  });
}
