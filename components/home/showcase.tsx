import type { ReactNode } from "react";
import { Nfc } from "lucide-react";
import { SHOWCASE } from "@/content/pages/home";
import { cx } from "@/components/ui/cx";
import { ShowcaseTabs } from "./showcase-tabs";
import styles from "./showcase.module.css";

/*
 * The showcase panels are illustrations of each system's main screen. Every
 * value inside them is synthetic, and each frame says so in its footer. They
 * render on the server; only the tab switching ships to the browser.
 */

type GhostRow = readonly [label: string, value: string];

function Ghost({ title, rows, className }: { title: string; rows: readonly GhostRow[]; className?: string }) {
  return (
    <div className={cx(styles.ghost, className)} aria-hidden="true">
      <b>{title}</b>
      {rows.map(([label, value]) => (
        <div key={label} className={styles.ghostRow}>
          <span>{label}</span>
          <span>{value}</span>
        </div>
      ))}
    </div>
  );
}

function Focus({ title, hint, foot, wide, children }: { title: string; hint: string; foot?: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={cx(styles.focus, wide && styles.wide)} data-focus>
      <div className={styles.focusBody}>
        {/* The mock screen's own title: part of the illustration, not a heading
            of the page (its tab panel is already named by its tab). */}
        <p className={styles.focusTitle}>{title}</p>
        <p className={styles.hint}>{hint}</p>
        {children}
      </div>
      {foot ? (
        <div className={styles.focusFoot}>
          <span className={styles.sample}>{foot}</span>
        </div>
      ) : null}
    </div>
  );
}

function Kv({ label, children, ok }: { label: string; children: ReactNode; ok?: boolean }) {
  return (
    <div className={styles.kv}>
      <span>{label}</span>
      {ok ? <span className={styles.ok}>{children}</span> : <b>{children}</b>}
    </div>
  );
}

/** A non-interactive picture of the panel's primary action. */
function MockButton({ children }: { children: ReactNode }) {
  return (
    <span className={styles.mockButton} aria-hidden="true">
      {children}
    </span>
  );
}

const RecordsPanel = (
  <>
    <Ghost title="Indicator list" rows={[["Names and terms", "14"], ["Case numbers", "6"], ["Updated", "today"]]} className={styles.ghostLeft} />
    <Ghost title="Audit trail" rows={[["Manifest", "written"], ["Originals", "unchanged"], ["Names in logs", "hashed"]]} className={styles.ghostRight} />
    <Focus title="Triage run complete" hint="Scans, faxes and Office files, read on this PC" foot={SHOWCASE.sample}>
      <Kv label="Needs review">312</Kv>
      <Kv label="Other">12,141</Kv>
      <Kv label="Error, re-run">27</Kv>
      <Kv label="Leaves this PC" ok>
        Licence check only
      </Kv>
      <MockButton>Open the needs-review copies</MockButton>
    </Focus>
  </>
);

const NfcPanel = (
  <>
    <Ghost title="Live status" rows={[["Rounds due", "48"], ["Missed", "2"], ["Excused", "1"]]} className={styles.ghostLeft} />
    <Ghost title="Compliance report" rows={[["Period", "this week"], ["Export", "Excel, PDF"]]} className={styles.ghostRightHigh} />
    <Focus title="Room 214" hint="Tap the tag at the door to record this round" foot={SHOWCASE.sample}>
      <div className={styles.tag} aria-hidden="true">
        <span className={styles.ring} />
        <span className={cx(styles.ring, styles.ring2)} />
        <Nfc strokeWidth={1.6} />
      </div>
      <Kv label="Round recorded" ok>
        10:42
      </Kv>
      <Kv label="Next">Room 216</Kv>
    </Focus>
  </>
);

const DbWhisperPanel = (
  <>
    <Ghost title="Schema retrieval" rows={[["Tables matched", "2"], ["Dialect", "Postgres"]]} className={styles.ghostLeft} />
    <Ghost title="Policy" rows={[["Writes", "denied"], ["Multiple statements", "denied"]]} className={styles.ghostRight} />
    <Focus title="Ask your database" hint="“Revenue by month, January to April 2024”" foot={SHOWCASE.noQuery}>
      <pre className={styles.sql}>
        {"SELECT date_trunc('month', created_at) AS month,\n  SUM(amount) AS revenue\nFROM orders GROUP BY 1 ORDER BY 1;"}
      </pre>
      <ul className={styles.checks}>
        <li>Single statement</li>
        <li>Read-only</li>
        <li>Enrolled schema</li>
      </ul>
      <MockButton>Run read-only</MockButton>
    </Focus>
  </>
);

const AssistantPanel = (
  <Focus title="Ask about my work" hint="Answers come from this site and cite the page they used" foot={SHOWCASE.sample} wide>
    <p className={styles.chatQ}>What has Mubin shipped for healthcare teams?</p>
    <div className={styles.chatA}>
      Two systems in use at a healthcare operation: records triage that keeps documents on the facility&apos;s own PCs,
      and NFC room rounds for care staff.
      <div className={styles.cite}>
        <span>Field work · Records triage</span>
        <span>Field work · NFC rounds</span>
      </div>
    </div>
    <p className={styles.askInput} aria-hidden="true">
      Ask a question…
    </p>
  </Focus>
);

/** The tabbed showcase under the hero: four systems, one illustrated screen each. */
export function Showcase() {
  return (
    <ShowcaseTabs
      label={SHOWCASE.label}
      items={[
        { id: "records", label: SHOWCASE.tabs.records, panel: RecordsPanel },
        { id: "nfc", label: SHOWCASE.tabs.nfc, panel: NfcPanel },
        { id: "dbwhisper", label: SHOWCASE.tabs.dbwhisper, panel: DbWhisperPanel },
        { id: "assistant", label: SHOWCASE.tabs.assistant, panel: AssistantPanel },
      ]}
    />
  );
}
