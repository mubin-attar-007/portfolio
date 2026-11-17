import { CaretLink } from "@/components/ui/caret-link";
import { StatusPill } from "@/components/ui/status-pill";
import { TRUST_PAGE, type EvidenceRow } from "./trust-copy";
import styles from "./trust.module.css";

/**
 * EvidenceTable — "Evidence at a glance": area, claim, status pill, source.
 * Rows that are NOT claimed carry no link, so an absence reads as a stated
 * fact, not a gap. Below 760px each row becomes a stacked card.
 */
export function EvidenceTable({ rows }: { rows: readonly EvidenceRow[] }) {
  const c = TRUST_PAGE.glance.columns;
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <caption className="sr-only">{TRUST_PAGE.glance.title}</caption>
        <thead>
          <tr>
            <th scope="col">{c.area}</th>
            <th scope="col">{c.claim}</th>
            <th scope="col">{c.status}</th>
            <th scope="col">{c.source}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.area}-${row.claim}`}>
              <th scope="row">{row.area}</th>
              <td className={styles.claimCell}>{row.claim}</td>
              <td className={styles.statusCell}>
                <StatusPill status={row.status} />
              </td>
              <td className={styles.sourceCell}>
                {row.source ? (
                  <CaretLink href={row.source.href} weight="regular">
                    {row.source.label}
                  </CaretLink>
                ) : (
                  <span className={styles.none}>{TRUST_PAGE.glance.noSource}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
