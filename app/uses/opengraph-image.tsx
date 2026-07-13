import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Uses — the $0 stack behind four live products";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return renderOg({
    eyebrow: "mubin attar · uses",
    title: "The $0 stack behind four live products.",
    subtitle: "A deliberately boring, free-tier stack — and why.",
    footerRight: "/uses",
  });
}
