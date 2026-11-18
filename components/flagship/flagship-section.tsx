import type { ReactNode } from "react";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/ui/section-header";
import styles from "./flagship.module.css";

/**
 * FlagshipSection — one titled band of a flagship case study: a stable anchor
 * id, a kicker, an h2 and an optional lead, then the body. The section is
 * named by its heading (`aria-labelledby`), so every band is a landmark.
 */
export function FlagshipSection({
  id,
  kicker,
  title,
  lead,
  tone = "page",
  space = "md",
  children,
}: {
  id: string;
  kicker: string;
  title: string;
  lead?: string;
  tone?: "page" | "subtle";
  space?: "sm" | "md";
  children: ReactNode;
}) {
  const headingId = `${id}-title`;
  return (
    <Section id={id} tone={tone} space={space} ariaLabelledBy={headingId}>
      <SectionHeader id={headingId} kicker={kicker} title={title} lead={lead} />
      <div className={styles.sectionBody}>{children}</div>
    </Section>
  );
}
