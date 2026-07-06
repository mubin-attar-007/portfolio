import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Work — four live AI systems, deep-dived · Mubin Attar";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** OG card for the /work index. */
export default function OG() {
  return renderOg({
    eyebrow: "mubin attar · selected work",
    title: "Four live AI systems — how each one is built.",
    subtitle: "DBWhisper · TradePulse · CrownWager · LLM Studio. Deep case studies with decisions, failures, and methods.",
    footerRight: "/work",
  });
}
