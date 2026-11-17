import { ArrowRight, ArrowDownToLine, Lock } from "lucide-react";
import { Bento, Card, CardBody } from "@/components/ui/card";
import { Plate } from "@/components/ui/plate";
import { SectionHeader } from "@/components/ui/section-header";
import { StickySteps } from "@/components/ui/sticky-steps";
import type { FieldReport } from "@/content/field";
import type { BoundaryRow } from "@/content/field/types";
import { FIELD_LABELS, FIELD_SECTION_IDS } from "@/content/field/labels";
import { FieldSection } from "./field-section";
import { ArchitectureSketch } from "./sketch";
import styles from "./field.module.css";

const L = FIELD_LABELS.sections;

/**
 * The trace: numbered steps beside a sticky frame, on a dark plate. Each
 * step's media is the report's own sketch with the part it touches lit.
 */
export function TraceSection({ report }: { report: FieldReport }) {
  const headingId = `${FIELD_SECTION_IDS.trace}-title`;
  return (
    <Plate id={FIELD_SECTION_IDS.trace} labelledBy={headingId} className="scroll-mt-[var(--sticky-top)]">
      <SectionHeader id={headingId} kicker={L.trace.kicker} kickerTone="cyan" title={L.trace.title} lead={L.trace.lead} />
      <StickySteps
        className="mt-12"
        label={L.trace.label}
        steps={report.trace.map((step) => ({
          id: step.title,
          title: step.title,
          body: step.body,
          media: (
            <div className={styles.traceMedia}>
              <ArchitectureSketch sketch={report.sketch} orientation="column" focus={step.focus} caption={false} />
            </div>
          ),
        }))}
      />
    </Plate>
  );
}

/** Further sketches (the cloud side of a system), when the report has them. */
export function ArchitectureSection({ report }: { report: FieldReport }) {
  if (report.moreSketches.length === 0) return null;
  return (
    <FieldSection id={FIELD_SECTION_IDS.architecture} kicker={L.architecture.kicker} title={L.architecture.title}>
      <div className="grid gap-8">
        {report.moreSketches.map((sketch, i) => {
          const titleId = `${FIELD_SECTION_IDS.architecture}-sketch-${i}`;
          return (
            <div key={sketch.title} className={`${styles.stage} ${styles.stageInline}`}>
              <div className={styles.stageHead}>
                <h3 id={titleId} className={styles.stageTitle}>
                  {sketch.title}
                </h3>
              </div>
              <ArchitectureSketch sketch={sketch} titleId={titleId} />
            </div>
          );
        })}
      </div>
    </FieldSection>
  );
}

const DIRECTION_ICON = { stays: Lock, leaves: ArrowRight, enters: ArrowDownToLine } as const;

function Direction({ direction }: { direction: BoundaryRow["direction"] }) {
  const Icon = DIRECTION_ICON[direction];
  return (
    <span className={styles.direction}>
      <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
      {L.boundary.direction[direction]}
    </span>
  );
}

/** The boundary ledger: what crosses which boundary, which way, and under which rule. */
export function BoundarySection({ report }: { report: FieldReport }) {
  const c = L.boundary.columns;
  return (
    <FieldSection id={FIELD_SECTION_IDS.boundary} kicker={L.boundary.kicker} title={L.boundary.title}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className="sr-only">{L.boundary.title}</caption>
          <thead>
            <tr>
              <th scope="col">{c.data}</th>
              <th scope="col">{c.direction}</th>
              <th scope="col">{c.path}</th>
              <th scope="col">{c.rule}</th>
            </tr>
          </thead>
          <tbody>
            {report.boundary.map((row) => (
              <tr key={row.data}>
                <th scope="row">{row.data}</th>
                <td data-label={c.direction}>
                  <Direction direction={row.direction} />
                </td>
                <td data-label={c.path}>
                  <span className={styles.mono}>{row.path}</span>
                </td>
                <td data-label={c.rule}>{row.rule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FieldSection>
  );
}

/** Deployment: where it runs and how it ships, as short cards. */
export function DeploymentSection({ report }: { report: FieldReport }) {
  return (
    <FieldSection id={FIELD_SECTION_IDS.deployment} kicker={L.deployment.kicker} title={L.deployment.title} tone="subtle">
      <Bento columns={3}>
        {report.deployment.map((card, i) => (
          <Card key={card.title}>
            <CardBody className="mt-0">
              <span className={styles.decisionNum} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className={styles.decisionTitle}>{card.title}</h3>
              <p className="mt-3 text-[0.9375rem] leading-[1.6] text-ink-secondary">{card.body}</p>
            </CardBody>
          </Card>
        ))}
      </Bento>
    </FieldSection>
  );
}
