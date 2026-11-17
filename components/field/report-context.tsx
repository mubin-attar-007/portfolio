import { Cloud, FileText, Monitor, Server, Smartphone, LayoutDashboard, type LucideIcon } from "lucide-react";
import { Bento, Card, CardBody } from "@/components/ui/card";
import type { FieldReport } from "@/content/field";
import { FIELD_LABELS, FIELD_SECTION_IDS } from "@/content/field/labels";
import { FieldSection } from "./field-section";
import styles from "./field.module.css";

const L = FIELD_LABELS.sections;

/** The problem and who uses it: prose beside a users card. */
export function ProblemSection({ report }: { report: FieldReport }) {
  return (
    <FieldSection id={FIELD_SECTION_IDS.problem} kicker={L.problem.kicker} title={L.problem.title}>
      <div className={styles.twoCol}>
        <div className={styles.prose}>
          {report.problem.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <aside className={styles.aside} aria-labelledby={`${FIELD_SECTION_IDS.problem}-users`}>
          <h3 id={`${FIELD_SECTION_IDS.problem}-users`} className={styles.boxTitle}>
            {L.problem.users}
          </h3>
          <ul className={styles.dotList}>
            {report.problem.users.map((user) => (
              <li key={user}>{user}</li>
            ))}
          </ul>
        </aside>
      </div>
    </FieldSection>
  );
}

/** Constraints: a numbered ledger of constraint → what it forced → how it is checked. */
export function ConstraintsSection({ report }: { report: FieldReport }) {
  const c = L.constraints.columns;
  return (
    <FieldSection
      id={FIELD_SECTION_IDS.constraints}
      kicker={L.constraints.kicker}
      title={L.constraints.title}
      lead={L.constraints.lead}
      tone="subtle"
    >
      <div className={styles.ledger}>
        <div className={styles.ledgerHead} aria-hidden="true">
          <span className={styles.headCell}>#</span>
          <span className={styles.headCell}>{c.constraint}</span>
          <span className={styles.headCell}>{c.forced}</span>
          <span className={styles.headCell}>{c.checked}</span>
        </div>
        <ol className="m-0 list-none p-0">
          {report.constraints.map((row, i) => (
            <li key={row.constraint} className={styles.ledgerRow}>
              <span className={styles.ledgerNum} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className={styles.ledgerCell}>
                <span className={styles.cellLabel}>{c.constraint}</span>
                {row.constraint}
              </p>
              <p className={styles.ledgerCell}>
                <span className={styles.cellLabel}>{c.forced}</span>
                {row.forced}
              </p>
              <p className={styles.ledgerCell}>
                <span className={styles.cellLabel}>{c.checked}</span>
                {row.checked}
              </p>
            </li>
          ))}
        </ol>
      </div>
      <p className={styles.ledgerNote}>{report.constraintsNote}</p>
    </FieldSection>
  );
}

/** An icon per built group, by its generic title; unknown titles get the server icon. */
const GROUP_ICON: Record<string, LucideIcon> = {
  Desktop: Monitor,
  Cloud,
  Mobile: Smartphone,
  API: Server,
  Portal: LayoutDashboard,
  Docs: FileText,
};

/** What I built: grouped cards, then the credit notes (built by others, how it was built). */
export function BuiltSection({ report }: { report: FieldReport }) {
  const columns = report.built.length % 3 === 0 ? 3 : 2;
  return (
    <FieldSection id={FIELD_SECTION_IDS.built} kicker={L.built.kicker} title={L.built.title}>
      <Bento columns={columns}>
        {report.built.map((group) => {
          const Icon = GROUP_ICON[group.title] ?? Server;
          return (
            <Card key={group.title}>
              <CardBody className="mt-0">
                <h3 className={styles.groupTitle}>
                  <span className={styles.groupIcon} aria-hidden="true">
                    <Icon size={16} strokeWidth={1.75} />
                  </span>
                  {group.title}
                </h3>
                <ul className={styles.dotList}>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          );
        })}
      </Bento>
      <div className={styles.creditRow}>
        {report.others.length ? (
          <div className={styles.note}>
            <h3 className={styles.boxTitle}>{L.built.others}</h3>
            {report.others.map((line) => (
              <p key={line} className="mt-2">
                {line}
              </p>
            ))}
          </div>
        ) : null}
        <div className={styles.note}>
          <h3 className={styles.boxTitle}>{L.built.howBuilt}</h3>
          <p className="mt-2">{report.howBuilt}</p>
        </div>
      </div>
    </FieldSection>
  );
}
