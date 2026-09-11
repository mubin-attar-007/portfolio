"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check, Minus, ShieldCheck, X } from "lucide-react";
import type { BoundaryCase } from "@/content/dbwhisper-boundary";
import styles from "./boundary-inspector.module.css";

/** A manual, finite illustration. It never parses SQL or sends a database request. */
export function BoundaryInspector({ cases, evidence }: {
  cases: readonly BoundaryCase[];
  evidence: ReactNode;
}) {
  const [selection, setSelection] = useState({ selected: cases[0]!.id, previous: "", revision: 0 });
  const [announcement, setAnnouncement] = useState("");
  const active = cases.find((item) => item.id === selection.selected) ?? cases[0]!;
  const previous = cases.find((item) => item.id === selection.previous);
  const index = cases.indexOf(active);

  return (
    <figure id="boundary-inspector" className={styles.inspector} aria-labelledby="boundary-title">
      <div className={styles.heading}>
        <div>
          <p className={styles.kicker}>Selected system / 01</p>
          <h2 id="boundary-title">DBWhisper</h2>
          <p className={styles.subtitle}>The model proposes. The validator decides.</p>
        </div>
        <ShieldCheck size={24} strokeWidth={1.4} aria-hidden />
      </div>
      <fieldset className={styles.choices} aria-label="Inspect a query boundary">
        <legend className="sr-only">Inspect a boundary</legend>
        <div className={styles.options} style={{ "--selected-index": index } as CSSProperties}>
          <span className={styles.selectionIndicator} data-selection-indicator aria-hidden />
          {cases.map((item) => (
            <label key={item.id} className={styles.option}>
              <input type="radio" name="query-boundary" value={item.id} checked={active.id === item.id}
                onChange={() => {
                  setSelection((current) => ({ selected: item.id, previous: current.selected, revision: current.revision + 1 }));
                  setAnnouncement(`${item.label}: ${item.title}.`);
                }}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className={styles.example} data-boundary-case={active.id}>
        <div className={styles.proposed}>
          <div className={styles.codeHead}><span>Proposed SQL</span><span>PostgreSQL</span></div>
          <pre className={styles.sql}><code key={active.sql} data-changed={previous && previous.sql !== active.sql ? "" : undefined}>{active.sql}</code></pre>
          <p className={styles.context}>{active.context}</p>
        </div>
        <div className={styles.connector} aria-hidden>
          <ArrowDown key={selection.revision} data-changed={previous ? "" : undefined} size={15} strokeWidth={1.5} />
        </div>
        <div className={styles.validation}>
        <p className={styles.codeHead}>Validator checks</p>
        <ul className={styles.checks} aria-label="Illustrated validator checks">
          {active.checks.map((check, i) => {
            const oldCheck = previous?.checks[i];
            const changed = oldCheck && (oldCheck.state !== check.state || oldCheck.result !== check.result);
            const Icon = check.state === "pass" ? Check : check.state === "fail" ? X : Minus;
            return <li key={`${check.label}:${changed ? selection.revision : "still"}`} data-check-state={check.state} data-changed={changed ? "" : undefined}>
              <Icon size={14} strokeWidth={1.8} aria-hidden />
              <span>{check.label}</span><span className={styles.checkResult}>{check.result}</span>
            </li>;
          })}
        </ul>
        </div>
        <div className={styles.outcome} role="region" aria-label="Boundary result" data-outcome={active.outcome}>
          <p className={styles.outcomeTitle}>
            {active.outcome === "eligible" ? <Check size={16} aria-hidden /> : <X size={16} aria-hidden />}
            {active.title}
          </p>
          <p className={styles.explanation}>{active.explanation}</p>
        </div>
      </div>
      <figcaption className={styles.caption}>
        <span>Illustrative cases · no query is sent</span>
        <Link href="/work/dbwhisper#request-walkthrough" prefetch={false}>Full request path<ArrowUpRight size={13} aria-hidden /></Link>
      </figcaption>
      <div className={styles.evidence}>{evidence}</div>
      <p className="sr-only" role="status">{announcement}</p>
    </figure>
  );
}
