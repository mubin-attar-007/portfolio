import { renderOg, OG_SIZE, OG_CONTENT_TYPE, formatOgEyebrow } from "@/lib/og";

export const alt = "Privacy Policy — Mubin Attar";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return renderOg({
    eyebrow: formatOgEyebrow("Privacy"),
    title: "Privacy by design.",
    subtitle:
      "Minimal telemetry, explicit data boundaries, and documented external service usage.",
    footerRight: "/privacy",
  });
}
