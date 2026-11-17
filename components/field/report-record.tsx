import { CircleCheck, CircleMinus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bento, Card, CardBody } from "@/components/ui/card";
import { Kicker } from "@/components/ui/kicker";
import { INTEGRATIONS } from "@/config/site";
import type { FieldReport } from "@/content/field";
import { FIELD_LABELS, FIELD_SECTION_IDS } from "@/content/field/labels";
import { FieldSection } from "./field-section";
import styles from "./field.module.css";

const L = FIELD_LABELS.sections;

/** What broke: a rail of incidents, each broke → cause → change → guard. */
export function IncidentsSection({ report }: { report: FieldReport }) {
  const f = L.broke.fields;
  return (
    <FieldSection id={FIELD_SECTION_IDS.broke} kicker={L.broke.kicker} title={L.broke.title} lead={L.broke.lead}>
      <ol className={styles.incidents} aria-label={L.broke.label}>
        {report.incidents.map((incident) => (
          <li key={incident.id} id={`incident-${incident.id}`} className={styles.incident}>
            <span className={styles.incidentDot} aria-hidden="true" />
            <article className={styles.incidentCard} aria-labelledby={`incident-${incident.id}-title`}>
              <h3 id={`incident-${incident.id}-title`} className={styles.incidentTitle}>
                {incident.title}
              </h3>
              <dl className={styles.incidentGrid}>
                <div>
                  <dt>{f.broke}</dt>
                  <dd>{incident.broke}</dd>
                </div>
                <div>
                  <dt>{f.cause}</dt>
                  <dd>{incident.cause}</dd>
                </div>
                <div>
                  <dt>{f.change}</dt>
                  <dd>{incident.change}</dd>
                </div>
                <div className={styles.guard}>
                  <dt>
                    <ShieldCheck size={12} strokeWidth={2} aria-hidden="true" />
                    {f.guard}
                  </dt>
                  <dd>{incident.guard}</dd>
                </div>
              </dl>
            </article>
          </li>
        ))}
      </ol>
    </FieldSection>
  );
}

/** Decisions: choice · instead of · why · trade-off, as cards. */
export function DecisionsSection({ report }: { report: FieldReport }) {
  const f = L.decisions.fields;
  return (
    <FieldSection id={FIELD_SECTION_IDS.decisions} kicker={L.decisions.kicker} title={L.decisions.title} tone="subtle">
      <Bento columns={report.decisions.length % 2 === 0 ? 2 : 3}>
        {report.decisions.map((decision, i) => (
          <Card key={decision.choice}>
            <CardBody className="mt-0">
              <span className={styles.decisionNum} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className={styles.decisionTitle}>{decision.choice}</h3>
              <dl className={styles.facts}>
                <div className={styles.instead}>
                  <dt>{f.instead}</dt>
                  <dd>{decision.instead}</dd>
                </div>
                <div>
                  <dt>{f.reason}</dt>
                  <dd>{decision.reason}</dd>
                </div>
                <div>
                  <dt>{f.tradeoff}</dt>
                  <dd>{decision.tradeoff}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>
        ))}
      </Bento>
    </FieldSection>
  );
}

function TickList({ items, tone }: { items: readonly string[]; tone: "yes" | "no" }) {
  const Icon = tone === "yes" ? CircleCheck : CircleMinus;
  return (
    <ul className={styles.tickList}>
      {items.map((item) => (
        <li key={item}>
          <Icon size={16} strokeWidth={1.75} aria-hidden="true" className={tone === "yes" ? styles.tickIcon : styles.crossIcon} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Verification: the checks and gates beside the explicit "Not measured" box. */
export function VerificationSection({ report }: { report: FieldReport }) {
  return (
    <FieldSection id={FIELD_SECTION_IDS.verification} kicker={L.verification.kicker} title={L.verification.title}>
      <div className={styles.twoCol}>
        <div>
          <h3 className={styles.boxTitle}>{L.verification.checks}</h3>
          <TickList items={report.verification.checks} tone="yes" />
        </div>
        <aside className={styles.notMeasured} aria-labelledby="not-measured-title">
          <h3 id="not-measured-title" className={styles.boxTitle}>
            {L.verification.notMeasured}
          </h3>
          <p className={styles.boxLead}>{L.verification.notMeasuredLead}</p>
          <TickList items={report.verification.notMeasured} tone="no" />
        </aside>
      </div>
    </FieldSection>
  );
}

/** Outcome: what the record proves, beside what it doesn't show. */
export function OutcomeSection({ report }: { report: FieldReport }) {
  return (
    <FieldSection id={FIELD_SECTION_IDS.outcome} kicker={L.outcome.kicker} title={L.outcome.title} tone="subtle">
      <div className={styles.outcome}>
        <div className={styles.outcomeCol}>
          <h3 className={styles.boxTitle}>{L.outcome.proves}</h3>
          <TickList items={report.outcome.proves} tone="yes" />
        </div>
        <div className={styles.outcomeCol} data-tone="muted">
          <h3 className={styles.boxTitle}>{L.outcome.notShown}</h3>
          <TickList items={report.outcome.notShown} tone="no" />
        </div>
      </div>
    </FieldSection>
  );
}

/** The walkthrough CTA: what a call covers, what stays private, and the page's primary action. */
export function WalkthroughSection({ report }: { report: FieldReport }) {
  const w = L.walkthrough;
  const headingId = `${FIELD_SECTION_IDS.walkthrough}-title`;
  return (
    <section
      id={FIELD_SECTION_IDS.walkthrough}
      aria-labelledby={headingId}
      className="scroll-mt-[var(--sticky-top)] bg-bg pt-[var(--space-section-md)] pb-[var(--space-section-lg-end)]"
    >
      <div className="mx-auto w-full max-w-[var(--width-container)] px-[var(--gutter)]">
        <div className={styles.walk}>
          <div className="relative max-w-[var(--width-head)]">
            <Kicker className="mb-4">{w.kicker}</Kicker>
            <h2 id={headingId} className="text-section text-balance text-ink">
              {w.title}
            </h2>
            <p className="mt-[18px] text-lead text-ink-secondary">{w.lead}</p>
            <div className={styles.actions}>
              <Button variant="violet" size="lg" caret href={FIELD_LABELS.cta.href}>
                {FIELD_LABELS.cta.primary}
              </Button>
              {INTEGRATIONS.calUrl ? (
                <Button variant="light" size="lg" caret href={INTEGRATIONS.calUrl} newTab>
                  {w.book}
                </Button>
              ) : null}
            </div>
          </div>
          <div className={styles.walkGrid}>
            <div>
              <h3 className={styles.boxTitle}>{w.covers}</h3>
              <TickList items={report.walkthrough.covers} tone="yes" />
            </div>
            <div>
              <h3 className={styles.boxTitle}>{w.staysPrivate}</h3>
              <TickList items={report.walkthrough.staysPrivate} tone="no" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
