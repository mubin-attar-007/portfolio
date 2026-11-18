import type { EvalRow, Project } from "@/content/schema";
import { evalAnchor } from "@/content/evals";
import { CaretLink } from "@/components/ui/caret-link";
import { StatusPill } from "@/components/ui/status-pill";
import { formatDate } from "@/lib/format";
import styles from "./case-study.module.css";

type ResultsLabels = {
  columns: { metric: string; sample: string; status: string; date: string };
  method: string;
  audit: string;
  claimsTitle: string;
  retiredReason: string;
};

/** "139 scored of 148" — the scored count, and the draw when cases were dropped. */
function sampleOf(score: NonNullable<EvalRow["score"]>): string {
  const { scored, sampled } = score;
  return sampled && sampled !== scored ? `${scored} scored of ${sampled}` : `${scored} scored`;
}

/** One registry row. Retired rows publish no figure, only the word and the reason. */
function ResultRow({ row, labels, selfHref }: { row: EvalRow; labels: ResultsLabels; selfHref: string }) {
  const retired = row.status === "retired";
  return (
    <li id={`result-${evalAnchor(row)}`} className={styles.result} data-retired={retired ? "" : undefined}>
      <div className={styles.resultHead}>
        <p className={styles.resultBenchmark}>{row.benchmark}</p>
        <StatusPill status={retired ? "retired" : "verified"} />
      </div>
      <p className={styles.resultValue}>{row.result}</p>
      <p className={styles.resultMetric}>{row.metric}</p>
      <dl className={styles.resultFacts}>
        {row.score ? (
          <div>
            <dt>{labels.columns.sample}</dt>
            <dd>{sampleOf(row.score)}</dd>
          </div>
        ) : null}
        {row.date ? (
          <div>
            <dt>{labels.columns.date}</dt>
            <dd>
              <time dateTime={row.date}>{formatDate(row.date)}</time>
            </dd>
          </div>
        ) : null}
      </dl>
      {retired && row.retired ? (
        <div className={styles.resultNote}>
          <p className={styles.resultNoteTitle}>{labels.retiredReason}</p>
          <p>{row.retired.reason}</p>
          <CaretLink href={row.retired.link} tone="muted" weight="regular">
            {labels.audit}
          </CaretLink>
        </div>
      ) : (
        <div className={styles.resultNote}>
          {row.note ? <p>{row.note}</p> : null}
          {/* A row whose method IS this page links nowhere new. */}
          {row.link && row.link !== selfHref ? (
            <CaretLink href={row.link} tone="accent" weight="regular">
              {labels.method}
            </CaretLink>
          ) : null}
        </div>
      )}
    </li>
  );
}

/**
 * Results — this project's rows from the eval registry (content/evals.ts),
 * retired rows included, and the claims that rest on design rather than a
 * scored run (content/projects.ts metrics), each with how it is checked.
 * Nothing here is typed by hand.
 */
export function Results({
  project,
  rows,
  labels,
}: {
  project: Project;
  rows: readonly EvalRow[];
  labels: ResultsLabels;
}) {
  const listed = new Set(rows.map((r) => r.result));
  const claims = project.metrics.filter((m) => !listed.has(m.value));
  return (
    <div className={styles.results}>
      {rows.length > 0 ? (
        <ul className={styles.resultList} data-count={rows.length}>
          {rows.map((row) => (
            <ResultRow key={evalAnchor(row)} row={row} labels={labels} selfHref={`/work/${project.slug}`} />
          ))}
        </ul>
      ) : null}
      {claims.length > 0 ? (
        <section aria-labelledby={`claims-${project.slug}`} className={styles.claims}>
          <h3 id={`claims-${project.slug}`} className={styles.claimsTitle}>
            {labels.claimsTitle}
          </h3>
          <dl className={styles.claimList}>
            {claims.map((m) => (
              <div key={m.label}>
                <dt>
                  <span className={styles.claimValue}>{m.value}</span>
                  <span className={styles.claimLabel}>{m.label}</span>
                </dt>
                <dd>{m.method}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </div>
  );
}
