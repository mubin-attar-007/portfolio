import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Notes — a running notebook by Mubin Attar";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return renderOg({
    eyebrow: "mubin attar · notes",
    title: "Notes",
    subtitle:
      "A running notebook on retrieval, evals, agents, and the infrastructure behind four live products.",
    footerRight: "/notes",
  });
}
