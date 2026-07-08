import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Talks & appearances — Mubin Attar";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return renderOg({
    eyebrow: "mubin attar · talks",
    title: "Talks & appearances",
    subtitle: "On evals, deterministic safety boundaries, retrieval, and shipping AI on a $0 stack.",
    footerRight: "/talks",
  });
}
