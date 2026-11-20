import type { ReactNode } from "react";
import { STATUS_PILL, type PillStatus } from "@/config/site";
import { cx } from "./cx";
import styles from "./pill.module.css";

type Tone = "positive" | "caution" | "accent" | "neutral" | "outline";

/** What each status means, as a colour: one meaning, one colour, site-wide. */
const TONE: Record<PillStatus, Tone> = {
  verified: "positive",
  "in-use": "positive",
  "deployed-demo": "accent",
  pilot: "caution",
  draft: "caution",
  retired: "neutral",
  archived: "neutral",
  "not-claimed": "outline",
};

/**
 * StatusPill — a status in the site's closed vocabulary: Verified, In use,
 * Deployed demo, Pilot, Draft, Retired, Archived, Not claimed (`STATUS_PILL`,
 * config/site.ts). The status fixes the colour; `children` may extend the label
 * ("Draft for owner review") but never change its meaning.
 *
 * Tones: positive (green) · accent (violet) · caution (amber) · neutral (grey)
 * · outline (dashed, for what is NOT claimed). Every text colour is AA on its
 * tint, on light and on dark grounds (tokens.css, `--pill-*`).
 *
 * A11y: the label carries the meaning; the dot is decorative, so colour is never
 * the only signal. Inline `<span>`: wrap it in a heading or a cell as needed.
 */
export function StatusPill({
  status,
  className,
  children,
}: {
  status: PillStatus;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span className={cx(styles.pill, styles.status, styles.dot, styles[TONE[status]], className)}>
      {children ?? STATUS_PILL[status]}
    </span>
  );
}
