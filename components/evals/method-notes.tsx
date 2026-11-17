import { CaretLink } from "@/components/ui/caret-link";
import { StatusPill } from "@/components/ui/status-pill";
import { evalAnchor, evals, evalsIntro } from "@/content/evals";
import { formatDate } from "@/lib/format";
import { evalsPage } from "./copy";
import styles from "./evals.module.css";

/**
 * MethodNotes — one card per registry row with its full method and evidence.
 * Each card carries the row's anchor (`evalAnchor`), so deep links from the
 * homepage, the case studies and the résumé land on the method, whatever the
 * table's filters show. A retired card keeps its reason and audit in full.
 */
export function MethodNotes() {
  return (
    <ul className={styles.notes} aria-label={evalsPage.methods.title}>
      {evals.map((row) => (
        <li key={evalAnchor(row)} id={evalAnchor(row)} className={styles.note}>
          <div className={styles.noteHead}>
            <span className={styles.noteSystem}>{row.system}</span>
            {row.retired ? (
              <StatusPill status="retired" />
            ) : (
              <StatusPill status="verified">{evalsPage.board.measured}</StatusPill>
            )}
          </div>
          <h3 className={styles.noteTitle}>{row.benchmark}</h3>
          {row.note ? <p className={styles.noteBody}>{row.note}</p> : null}
          {row.retired ? (
            <p className={`${styles.noteBody} ${styles.noteRetired}`}>
              <strong>
                {evalsIntro.retired.on} <time dateTime={row.retired.date}>{formatDate(row.retired.date)}</time>.
              </strong>{" "}
              {row.retired.reason}
            </p>
          ) : null}
          <div className={styles.noteFoot}>
            {row.retired ? (
              <CaretLink href={row.retired.link} tone="accent">
                {evalsIntro.retired.audit}
              </CaretLink>
            ) : row.link ? (
              <CaretLink href={row.link} tone="accent">
                {evalsPage.methods.evidence}
              </CaretLink>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
