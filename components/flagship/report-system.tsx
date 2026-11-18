import { ArrowDownToLine, ArrowRight, Lock } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { StickySteps } from "@/components/ui/sticky-steps";
import { FLAGSHIP_LABELS, FLAGSHIP_SECTION_IDS } from "@/content/flagship/labels";
import type { BoundaryRow, Flagship, Sketch } from "@/content/flagship/types";
import { FlagshipSection } from "./flagship-section";
import { ArchitectureSketch } from "./sketch";
import styles from "./flagship.module.css";

const L = FLAGSHIP_LABELS.sections;

/**
 * HowItWorks — the trace as numbered steps beside a sticky frame. Each step's
 * media is the product's own sketch with the part the step touches lit.
 */
export function HowItWorks({ flagship }: { flagship: Flagship }) {
  return (
    <FlagshipSection id={FLAGSHIP_SECTION_IDS.how} kicker={L.how.kicker} title={L.how.title} lead={L.how.lead}>
      <StickySteps
        className={styles.steps}
        label={L.how.label}
        steps={flagship.trace.map((step) => ({
          id: step.title,
          title: step.title,
          body: step.body,
          media: (
            <div className={styles.traceMedia}>
              <ArchitectureSketch
                sketch={flagship.sketch}
                orientation="column"
                focus={step.focus}
                caption={false}
                notes={false}
              />
            </div>
          ),
        }))}
      />
    </FlagshipSection>
  );
}

/** One sketch on its dotted stage, titled. */
function SketchStage({ sketch, titleId }: { sketch: Sketch; titleId: string }) {
  return (
    <div className={styles.stage}>
      <div className={styles.stageHead}>
        <h3 id={titleId} className={styles.stageTitle}>
          {sketch.title}
        </h3>
      </div>
      <ArchitectureSketch sketch={sketch} titleId={titleId} />
    </div>
  );
}

const DIRECTION_ICON = { stays: Lock, leaves: ArrowRight, enters: ArrowDownToLine } as const;

function Direction({ direction }: { direction: BoundaryRow["direction"] }) {
  const Icon = DIRECTION_ICON[direction];
  return (
    <span className={styles.direction}>
      <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
      {L.architecture.direction[direction]}
    </span>
  );
}

/**
 * ArchitectureSection — what runs where: every sketch of the product on its
 * stage (the pulse travels a wire while the stage is hovered), then the
 * boundary ledger: what crosses which boundary, which way, under which rule.
 */
export function ArchitectureSection({ flagship }: { flagship: Flagship }) {
  const c = L.architecture.columns;
  const boundaryId = `${FLAGSHIP_SECTION_IDS.architecture}-boundary`;
  return (
    <FlagshipSection id={FLAGSHIP_SECTION_IDS.architecture} kicker={L.architecture.kicker} title={L.architecture.title}>
      <div className={styles.architecture}>
        {[flagship.sketch, ...flagship.moreSketches].map((sketch, i) => (
          <SketchStage key={sketch.title} sketch={sketch} titleId={`${FLAGSHIP_SECTION_IDS.architecture}-sketch-${i}`} />
        ))}
      </div>
      <h3 id={boundaryId} className={styles.subTitle}>
        {L.architecture.boundary}
      </h3>
      <div className={styles.tableWrap}>
        <table className={styles.table} aria-labelledby={boundaryId}>
          <thead>
            <tr>
              <th scope="col">{c.data}</th>
              <th scope="col">{c.direction}</th>
              <th scope="col">{c.path}</th>
              <th scope="col">{c.rule}</th>
            </tr>
          </thead>
          <tbody>
            {flagship.boundary.map((row) => (
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
    </FlagshipSection>
  );
}

/**
 * DeploymentSection — where it runs and how it ships, as numbered rows, then
 * the stack: the technology by layer, and the AWS services it is hosted on.
 */
export function DeploymentSection({ flagship }: { flagship: Flagship }) {
  const stackId = `${FLAGSHIP_SECTION_IDS.deployment}-stack`;
  return (
    <FlagshipSection id={FLAGSHIP_SECTION_IDS.deployment} kicker={L.deployment.kicker} title={L.deployment.title}>
      <ol className={styles.deploy}>
        {flagship.deployment.map((card, i) => (
          <li key={card.title} className={styles.deployRow}>
            <span className={styles.cardNumber} aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardText}>{card.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <h3 id={stackId} className={styles.subTitle}>
        {L.architecture.stack}
      </h3>
      <div className={styles.stackGrid}>
        <div className={styles.stackGroup}>
          <p className={styles.stackLabel}>{L.architecture.aws}</p>
          <ul className={styles.chips}>
            {flagship.stack.aws.map((service) => (
              <Chip key={service} as="li" variant="raised">
                {service}
              </Chip>
            ))}
          </ul>
        </div>
        {flagship.stack.groups.map((group) => (
          <div key={group.label} className={styles.stackGroup}>
            <p className={styles.stackLabel}>{group.label}</p>
            <ul className={styles.chips}>
              {group.items.map((item) => (
                <Chip key={item} as="li" variant="outline">
                  {item}
                </Chip>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </FlagshipSection>
  );
}
