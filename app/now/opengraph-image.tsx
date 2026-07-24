import { renderOg, OG_SIZE, OG_CONTENT_TYPE, formatOgEyebrow } from "@/lib/og";

export const alt = "Now — what Mubin Attar is building, exploring, and reading";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return renderOg({
    eyebrow: formatOgEyebrow("Now"),
    title: "What I'm doing now",
    subtitle: "Building, exploring, and reading — a running snapshot, updated by hand.",
    footerRight: "/now",
  });
}
