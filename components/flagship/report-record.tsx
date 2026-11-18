import { CircleCheck, CircleMinus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bento, Card, CardBody } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { Kicker } from "@/components/ui/kicker";
import { ShowMore } from "@/components/ui/show-more";
import { AskAiQuestions } from "@/components/work/ask-ai";
import { NeighbourCards, type Neighbour } from "@/components/work/neighbour-cards";
import { INTEGRATIONS } from "@/config/site";
import { FLAGSHIP_LABELS, FLAGSHIP_SECTION_IDS, showFewerLabel, showMoreLabel } from "@/content/flagship/labels";
import { WALKTHROUGH } from "@/content/flagship/shared";
import type { Decision, Flagship, Incident } from "@/content/flagship/types";
import { askAiLabel } from "@/content/pages/work";
import { FlagshipSection } from "./flagship-section";
import { MediaGallery } from "./media-gallery";
import styles from "./flagship.module.css";

const L = FLAGSHIP_LABELS.sections;
const MORE = FLAGSHIP_LABELS.more;

/** "01", "02": the order of a list, set in mono and hidden from the reading order. */
const ordinal = (i: number) => String(i + 1).padStart(2, "0");

/**
 * CodeExcerpts — curated, sanitised excerpts of the production code: a list of
 * them beside one panel holding the chosen excerpt's story and its code
 * (media-gallery.tsx). Highlighted on the server by Shiki (CodeBlock); nothing
 * ships to the browser but the choosing and the copy button.
 */
export function CodeExcerpts({ flagship }: { flagship: Flagship }) {
  return (
    <FlagshipSection id={FLAGSHIP_SECTION_IDS.code} kicker={L.code.kicker} title={L.code.title} lead={L.code.lead} tone="subtle">
      <MediaGallery
        label={`${flagship.name}: ${L.code.kicker}`}
        listLabel={L.code.excerpts}
        stage={false}
        captions={false}
        tabs={[
          {
            id: "code",
            label: L.code.kicker,
            shots: flagship.excerpts.map((excerpt) => ({
              id: excerpt.id,
              title: excerpt.title,
              proves: excerpt.story,
              portrait: false,
              media: (
                <div className={styles.excerpt}>
                  <h3 className={styles.excerptTitle}>{excerpt.title}</h3>
                  <p className={styles.excerptStory}>{excerpt.story}</p>
                  <div className={styles.excerptCode}>
                    <CodeBlock code={excerpt.code} lang={excerpt.lang} filename={excerpt.file} />
                  </div>
                </div>
              ),
            })),
          },
        ]}
      />
    </FlagshipSection>
  );
}

/** How many incidents and decisions a phone shows before "Show N more …". */
const PHONE_INCIDENTS = 2;
const PHONE_DECISIONS = 2;

/** One incident on the rail: broke → cause → change → guard. */
function IncidentItem({ incident }: { incident: Incident }) {
  const f = L.broke.fields;
  const id = `incident-${incident.id}`;
  return (
    <li id={id} className={styles.incident}>
      <span className={styles.incidentDot} aria-hidden="true" />
      <article className={styles.incidentCard} aria-labelledby={`${id}-title`}>
        <h3 id={`${id}-title`} className={styles.incidentTitle}>
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
  );
}

/**
 * What broke: a rail of incidents, each broke → cause → change → guard. A
 * phone shows the first two and holds the rest behind ShowMore; the rail runs
 * past the control to the last incident. A product with no incident on record
 * shows no section (none is ever made up to fill it).
 */
export function IncidentsSection({ flagship }: { flagship: Flagship }) {
  if (flagship.incidents.length === 0) return null;
  const shown = flagship.incidents.slice(0, PHONE_INCIDENTS);
  const rest = flagship.incidents.slice(PHONE_INCIDENTS);
  return (
    <FlagshipSection id={FLAGSHIP_SECTION_IDS.broke} kicker={L.broke.kicker} title={L.broke.title} lead={L.broke.lead} tone="subtle">
      <div className={styles.incidents}>
        <ol className={styles.incidentList} aria-label={L.broke.label}>
          {shown.map((incident) => (
            <IncidentItem key={incident.id} incident={incident} />
          ))}
        </ol>
        {rest.length > 0 ? (
          <ShowMore
            more={showMoreLabel(rest.length, MORE.incidents)}
            less={showFewerLabel(MORE.incidents)}
            className={styles.incidentsMore}
          >
            <ol start={shown.length + 1} className={styles.incidentList}>
              {rest.map((incident) => (
                <IncidentItem key={incident.id} incident={incident} />
              ))}
            </ol>
          </ShowMore>
        ) : null}
      </div>
    </FlagshipSection>
  );
}

/** One decision: the choice, what it replaced, why, and its cost. */
function DecisionCard({ decision, index }: { decision: Decision; index: number }) {
  const f = L.decisions.fields;
  return (
    <Card>
      <CardBody className="mt-0">
        <span className={styles.cardNumber} aria-hidden="true">
          {ordinal(index)}
        </span>
        <h3 className={styles.cardTitle}>{decision.choice}</h3>
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
  );
}

/**
 * Decisions: the choice, what it replaced, why, and its cost, as cards. A
 * phone shows the first two; the rest wait behind ShowMore, which lays its
 * cards into the same grid on wider screens.
 */
export function DecisionsSection({ flagship }: { flagship: Flagship }) {
  const shown = flagship.decisions.slice(0, PHONE_DECISIONS);
  const rest = flagship.decisions.slice(PHONE_DECISIONS);
  return (
    <FlagshipSection id={FLAGSHIP_SECTION_IDS.decisions} kicker={L.decisions.kicker} title={L.decisions.title}>
      <Bento columns={flagship.decisions.length % 3 === 0 ? 3 : 2}>
        {shown.map((decision, i) => (
          <DecisionCard key={decision.choice} decision={decision} index={i} />
        ))}
        {rest.length > 0 ? (
          <ShowMore
            more={showMoreLabel(rest.length, MORE.decisions)}
            less={showFewerLabel(MORE.decisions)}
            className={styles.bentoMore}
          >
            {rest.map((decision, i) => (
              <DecisionCard key={decision.choice} decision={decision} index={shown.length + i} />
            ))}
          </ShowMore>
        ) : null}
      </Bento>
    </FlagshipSection>
  );
}

function TickList({ items, tone }: { items: readonly string[]; tone: "yes" | "no" }) {
  const Icon = tone === "yes" ? CircleCheck : CircleMinus;
  return (
    <ul className={styles.tickList}>
      {items.map((item) => (
        <li key={item}>
          <Icon
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
            className={tone === "yes" ? styles.tickIcon : styles.crossIcon}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Verification — the test suites with how each figure was produced (the hero's
 * test counts link here), the checks and gates, and what is not measured.
 */
export function VerificationSection({ flagship }: { flagship: Flagship }) {
  const v = L.verification;
  const notMeasuredId = `${FLAGSHIP_SECTION_IDS.verification}-not-measured`;
  return (
    <FlagshipSection id={FLAGSHIP_SECTION_IDS.verification} kicker={v.kicker} title={v.title} tone="subtle">
      <ul className={styles.suites} aria-label={v.suites}>
        {flagship.verification.suites.map((suite) => (
          <li key={suite.label} className={styles.suite}>
            <span className={styles.suiteValue}>{suite.value}</span>
            <span className={styles.suiteLabel}>{suite.label}</span>
            <span className={styles.suiteMethod}>{suite.method}</span>
          </li>
        ))}
      </ul>
      <div className={styles.twoCol}>
        <div>
          <h3 className={styles.boxTitle}>{v.checks}</h3>
          <TickList items={flagship.verification.checks} tone="yes" />
        </div>
        <aside className={styles.notMeasured} aria-labelledby={notMeasuredId}>
          <h3 id={notMeasuredId} className={styles.boxTitle}>
            {v.notMeasured}
          </h3>
          <p className={styles.boxLead}>{v.notMeasuredLead}</p>
          <TickList items={flagship.verification.notMeasured} tone="no" />
        </aside>
      </div>
    </FlagshipSection>
  );
}

/** Outcome: what the record proves, beside what it doesn't show. */
export function OutcomeSection({ flagship }: { flagship: Flagship }) {
  return (
    <FlagshipSection id={FLAGSHIP_SECTION_IDS.outcome} kicker={L.outcome.kicker} title={L.outcome.title} tone="subtle">
      <div className={styles.outcome}>
        <div className={styles.outcomeColumn}>
          <h3 className={styles.boxTitle}>{L.outcome.proves}</h3>
          <TickList items={flagship.outcome.proves} tone="yes" />
        </div>
        <div className={styles.outcomeColumn} data-tone="muted">
          <h3 className={styles.boxTitle}>{L.outcome.notShown}</h3>
          <TickList items={flagship.outcome.notShown} tone="no" />
        </div>
      </div>
    </FlagshipSection>
  );
}

/**
 * WalkthroughSection — the closing call to action: what a call covers and
 * what stays private, the page's one violet action, the case study's starter
 * questions for the site's assistant (each chip asks its own question), then
 * the previous and next case studies.
 *
 * Props: `product` (names the questions), `questions` (from
 * `CASE_STUDY_STARTERS`; none renders no chips), `previous`, `next`.
 */
export function WalkthroughSection({
  product,
  questions,
  previous,
  next,
}: {
  product: string;
  questions: readonly string[];
  previous: Neighbour | null;
  next: Neighbour | null;
}) {
  const w = L.walkthrough;
  const headingId = `${FLAGSHIP_SECTION_IDS.walkthrough}-title`;
  return (
    <section
      id={FLAGSHIP_SECTION_IDS.walkthrough}
      aria-labelledby={headingId}
      className="bg-bg pt-[var(--space-section-md)] pb-[var(--space-section-lg-end)]"
    >
      <div className="mx-auto w-full max-w-[var(--width-container)] px-[var(--gutter)]">
        <div className={styles.walk}>
          <div className="relative max-w-[var(--width-head)]">
            <Kicker className="mb-4">{w.kicker}</Kicker>
            <h2 id={headingId} className="text-section text-balance text-ink">
              {w.title}
            </h2>
            <p className="mt-[18px] text-lead text-ink-secondary">{w.lead}</p>
            <div className={styles.walkActions}>
              <Button variant="violet" size="lg" caret href={FLAGSHIP_LABELS.cta.href}>
                {FLAGSHIP_LABELS.cta.walkthrough}
              </Button>
              {INTEGRATIONS.calUrl ? (
                <Button variant="light" size="lg" href={INTEGRATIONS.calUrl} newTab>
                  {w.book}
                </Button>
              ) : null}
            </div>
          </div>
          <div className={styles.walkGrid}>
            <div>
              <h3 className={styles.boxTitle}>{w.covers}</h3>
              <TickList items={WALKTHROUGH.covers} tone="yes" />
            </div>
            <div>
              <h3 className={styles.boxTitle}>{w.staysPrivate}</h3>
              <TickList items={WALKTHROUGH.staysPrivate} tone="no" />
            </div>
          </div>
          {questions.length > 0 ? (
            <div className={styles.walkAsk}>
              <AskAiQuestions title={askAiLabel(product)} questions={questions} />
            </div>
          ) : null}
        </div>
        <div className={styles.neighbours}>
          <NeighbourCards
            previous={previous}
            next={next}
            labels={FLAGSHIP_LABELS.neighbours}
            label={FLAGSHIP_LABELS.neighbours.label}
          />
        </div>
      </div>
    </section>
  );
}
