import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";
import { CASE_STUDY_CARD_ALT, flagshipCard } from "@/components/work/case-study-card";

export const alt = CASE_STUDY_CARD_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** The Bench Discovery case study's social card (static, at build time). */
export default function Image() {
  return flagshipCard("bench-discovery");
}
