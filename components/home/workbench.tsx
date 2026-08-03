"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { flagshipHome } from "@/content/home-visual";
import styles from "./workbench.module.css";

/**
 * Workbench — the site's signature element (design-system.md §8).
 *
 * A real DBWhisper run, opened for inspection: a plain-English question runs
 * through the live pipeline (Query → Agent trace → Eval). Not a fake terminal
 * typing marketing copy — a static, honest, TABBED readout of one captured run,
 * with the measured eval attached. The content is the already-authored
 * `flagshipHome.workbench` data.
 *
 * A11y: WAI-ARIA tabs. Roving tabindex, Arrow/Home/End navigation with automatic
 * activation, one visible tabpanel at a time. Server-rendered with the Query tab
 * active, so the initial HTML is complete (no CLS, never the LCP element — the
 * hero h1 is). No animation: the calm around the one bold idea.
 */
const wb = flagshipHome.workbench;
const TABS = wb.tabs;

export function Workbench() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();

  function select(next: number) {
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = TABS.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = active === last ? 0 : active + 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = active === 0 ? last : active - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    select(next);
  }

  return (
    <figure className={styles.workbench} aria-labelledby={`${id}-title`}>
      <figcaption className={styles.head}>
        <span className={styles.eyebrow}>
          <span className={styles.signal} aria-hidden />
          {wb.eyebrow}
        </span>
        <strong id={`${id}-title`}>{wb.title}</strong>
      </figcaption>

      <div role="tablist" aria-label="Inspect the DBWhisper run" className={styles.tabs} onKeyDown={onKeyDown}>
        {TABS.map((tab, i) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${id}-tab-${tab.id}`}
            aria-selected={active === i}
            aria-controls={`${id}-panel-${tab.id}`}
            tabIndex={active === i ? 0 : -1}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            className={styles.tab}
            onClick={() => setActive(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.stage}>
        {TABS.map((tab, i) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`${id}-panel-${tab.id}`}
            aria-labelledby={`${id}-tab-${tab.id}`}
            hidden={active !== i}
            className={styles.panel}
          >
            {tab.id === "query" ? <QueryPanel /> : null}
            {tab.id === "trace" ? <TracePanel /> : null}
            {tab.id === "eval" ? <EvalPanel /> : null}
          </div>
        ))}
      </div>

      <Link href={wb.eval.href} prefetch={false} className={styles.footLink}>
        Open the evaluation registry
        <ArrowUpRight aria-hidden size={14} />
      </Link>
    </figure>
  );
}

function QueryPanel() {
  return (
    <>
      <p className={styles.ask}>
        <span className={styles.askMark}>ask</span>
        {wb.question}
      </p>
      <div className={styles.sqlBlock}>
        <span className={styles.blockLabel}>Generated SQL · Postgres</span>
        <code>{wb.sql}</code>
      </div>
      <ol className={styles.stages}>
        {wb.stages.map((s) => (
          <li key={s.label}>
            <span className={styles.dot} aria-hidden />
            <span className={styles.stageLabel}>{s.label}</span>
            <span className={styles.stageDetail}>{s.detail}</span>
          </li>
        ))}
      </ol>
    </>
  );
}

function TracePanel() {
  return (
    <ol className={styles.trace}>
      {wb.trace.map((step) => (
        <li key={step.label}>
          <span className={styles.traceLabel}>{step.label}</span>
          <p>{step.detail}</p>
        </li>
      ))}
    </ol>
  );
}

function EvalPanel() {
  return (
    <div className={styles.evalPanel}>
      <p className={styles.evalSet}>{wb.eval.set}</p>
      <dl className={styles.evalRows}>
        {wb.eval.rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>
              <strong>{row.value}</strong>
              <span>{row.detail}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
