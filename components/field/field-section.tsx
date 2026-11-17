import type { ReactNode } from "react";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/ui/section-header";
import styles from "./field.module.css";

/**
 * FieldSection — one titled band of a field report: a stable anchor id, a
 * kicker, an h2 and an optional lead, then the body. The section is named by
 * its heading (`aria-labelledby`).
 */
export function FieldSection({
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
    <Section id={id} tone={tone} space={space} ariaLabelledBy={headingId} className="scroll-mt-[var(--sticky-top)]">
      <SectionHeader id={headingId} kicker={kicker} title={title} lead={lead} />
      <div className={styles.sectionBody}>{children}</div>
    </Section>
  );
}
