import type { ReactNode } from "react";
import { Check, Minus, X } from "lucide-react";
import { cx } from "@/components/ui/cx";
import styles from "./showcase.module.css";

/*
 * The pieces of an illustrated showcase screen, shared by the server-rendered
 * screens (showcase.tsx) and the ones a visitor can try (showcase-demos.tsx).
 * No hooks and no content imports, so a client module can use them without
 * pulling the content layer into the browser.
 */

export type GhostRow = readonly [label: string, value: string];

/** A faded side card: context behind the focus card (hidden on phones). */
export function Ghost({ title, rows, className }: { title: string; rows: readonly GhostRow[]; className?: string }) {
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

/** The screen's front card: a mock title, a hint, the body and a foot saying it is illustrative. */
export function Focus({ title, hint, foot, wide, children }: { title: string; hint: string; foot?: string; wide?: boolean; children: ReactNode }) {
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
          {/* data-illustrative: the interaction audit checks it stays on the stage. */}
          <span className={styles.sample} data-illustrative="">
            {foot}
          </span>
        </div>
      ) : null}
    </div>
  );
}

/** One of DBWhisper's validator checks, as its case study shows it (content/dbwhisper-boundary.ts). */
export type CheckRow = { label: string; state: "pass" | "fail" | "unknown"; result: string };

const CHECK_ICON = { pass: Check, fail: X, unknown: Minus } as const;

/**
 * The validator's checks in the order they run: the check and its result in
 * words, so the state never rests on the icon's colour alone. A check after a
 * failure is not reached.
 */
export function CheckList({ checks }: { checks: readonly CheckRow[] }) {
  return (
    <ul className={styles.checks}>
      {checks.map((check) => {
        const Icon = CHECK_ICON[check.state];
        return (
          <li key={check.label} data-state={check.state}>
            <Icon size={14} strokeWidth={2} aria-hidden />
            <span>{check.label}</span>
            <span className={styles.checkResult}>{check.result}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** The verdict under the checks: eligible for read-only execution, or refused before execution. */
export function Verdict({ outcome, children }: { outcome: "eligible" | "refused"; children: ReactNode }) {
  const Icon = outcome === "eligible" ? Check : X;
  return (
    <p className={styles.verdict} data-outcome={outcome}>
      <Icon size={15} strokeWidth={2.2} aria-hidden />
      {children}
    </p>
  );
}
