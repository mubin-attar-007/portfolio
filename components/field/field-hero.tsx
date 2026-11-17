import { Lock } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { CaretLink } from "@/components/ui/caret-link";
import { Chip } from "@/components/ui/chip";
import { CircuitArt } from "@/components/ui/circuit-art";
import { Kicker } from "@/components/ui/kicker";
import { Label } from "@/components/ui/label";
import { StatusPill } from "@/components/ui/status-pill";
import { FIELD_DRAFT, PRIVATE_NOTICE, type FieldReport } from "@/content/field";
import { FIELD_LABELS, FIELD_SECTION_IDS } from "@/content/field/labels";
import { ArchitectureSketch } from "./sketch";
import styles from "./field.module.css";

/** The draft ribbon: shown while a report is unpublished, so a preview never reads as published. */
export function DraftRibbon() {
  return (
    <div className={styles.ribbon} role="note" aria-label={FIELD_DRAFT.ribbon}>
      <div className={`mx-auto w-full max-w-[var(--width-container)] px-[var(--gutter)] ${styles.ribbonInner}`}>
        <StatusPill status="draft">{FIELD_DRAFT.ribbon}</StatusPill>
        <span>{FIELD_DRAFT.ribbonDetail}</span>
      </div>
    </div>
  );
}

/**
 * FieldHero — the product-page top of a field report: status pills, the
 * anonymous product statement (h1), the summary, the credit line, the private
 * badge and the walkthrough CTA, then the architecture sketch on a dotted stage.
 * No capture of the private system is ever shown.
 */
export function FieldHero({ report }: { report: FieldReport }) {
  const sketchTitleId = `${report.slug}-sketch-title`;
  return (
    <Section space="head" className={styles.hero}>
      <CircuitArt fade="top" />
      <div className={styles.heroText}>
        <div className={styles.pills}>
          {report.pills.map((pill) => (
            <StatusPill key={pill.label} status={pill.status}>
              {pill.label}
            </StatusPill>
          ))}
          <Chip mono icon={<Lock size={12} strokeWidth={1.75} aria-hidden="true" />}>
            {PRIVATE_NOTICE}
          </Chip>
        </div>
        <Kicker className="mb-4">{FIELD_LABELS.kicker}</Kicker>
        <h1 className="text-display text-balance text-ink">{report.headline}</h1>
        <p className="mt-6 max-w-[64ch] text-page-lead text-ink-secondary">{report.summary}</p>
        <p className={styles.credit}>
          <strong>{FIELD_LABELS.credit}</strong>
          <span>{report.credit}</span>
        </p>
        <div className={styles.actions}>
          <Button variant="violet" size="lg" caret href={FIELD_LABELS.cta.href}>
            {FIELD_LABELS.cta.primary}
          </Button>
          <CaretLink href={`#${FIELD_SECTION_IDS.walkthrough}`} tone="muted" weight="regular">
            {FIELD_LABELS.cta.secondary}
          </CaretLink>
        </div>
      </div>

      <div className={styles.stage}>
        <div className={styles.stageHead}>
          <h2 id={sketchTitleId} className={styles.stageTitle}>
            {report.sketch.title}
          </h2>
          <Label tone="tertiary" as="span">
            {report.domain}
          </Label>
        </div>
        <ArchitectureSketch sketch={report.sketch} titleId={sketchTitleId} />
      </div>
    </Section>
  );
}
