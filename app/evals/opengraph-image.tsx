import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Evals — how Mubin Attar measures the work";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return renderOg({
    eyebrow: "mubin attar · evals",
    title: "How I measure the work",
    subtitle: "The eval registry — method, metric, and the honest current state. No invented numbers.",
    footerRight: "/evals",
  });
}
