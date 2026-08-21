"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, CircleCheck, X } from "lucide-react";
import { EyebrowChip } from "@/components/ui/eyebrow-chip";
import { buttonVariants } from "@/components/ui/button";
import styles from "./walkthrough.module.css";

/** One stage's copy, as the server passes it down. */
export type WalkthroughStage = {
  id: "retrieve" | "generate" | "validate" | "execute" | "evaluate";
  label: string;
  body: string;
  items: readonly string[];
};

export type WalkthroughProps = {
  eyebrow: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
  stages: readonly WalkthroughStage[];
  refusalDemo: { prompt: string; verdict: string; reason: string };
  providers: readonly string[];
  /** Specimen data lifted from the hero stage so the two surfaces agree. */
  schema: readonly { name: string; cols: string; selected: boolean }[];
  sql: string;
  columns: readonly string[];
  rows: readonly (readonly string[])[];
  verdict: string;
  sampleLabel: string;
  /** Measured results, read from the eval registry by the server. */
  scores: readonly { value: string; label: string }[];
  registryHref: string;
};

/**
 * FlagshipWalkthrough — clerk.com's accordion-rail product section, adapted.
 *
 * The observed pattern: a narrow copy rail whose accordion drives a dominant
 * product specimen beside it. Here the accordion is DBWhisper's five stages —
 * Retrieve → Generate → Validate → Execute → Evaluate — and the specimen
 * renders the active stage as product UI. This replaces the static request-path
 * panel: the same facts, but the visitor walks them.
 *
 * Content arrives as props (a client component never imports the content layer
 * — that lesson cost 290KB once). The specimen's schema rows, SQL, result rows
 * and scores are the SAME objects the hero stage and the eval registry render,
 * so the surfaces cannot drift apart.
 *
 * A11y: a real disclosure pattern — each stage is a `<button aria-expanded>`
 * controlling a named region; exactly one stage is open, and the open state is
 * carried by a spine, a rotated chevron AND full-ink text, never colour alone.
 * The specimen panel is `aria-live="polite"` labelled by the active stage so a
 * screen-reader user hears the swap. Height animation is the recorded 0fr→1fr
 * disclosure exception; the swap collapses to instant under reduced motion via
 * the global rule.
 *
 * The refusal example is illustrative of real validator behaviour and the
 * specimen says so — it is not presented as a logged incident.
 */
export function FlagshipWalkthrough(props: WalkthroughProps) {
  const [active, setActive] = useState<WalkthroughStage["id"]>("retrieve");
  const stage = props.stages.find((s) => s.id === active) ?? props.stages[0]!;

  return (
    <div className={styles.layout}>
      {/* ---- rail ---- */}
      <div className={styles.rail}>
        <EyebrowChip>{props.eyebrow}</EyebrowChip>
        <h2 id="walkthrough-title" className="mt-4 text-balance text-section font-bold text-ink">
          {props.title}
        </h2>
        <p className="mt-3 max-w-[42ch] text-pretty text-base text-ink-secondary">{props.body}</p>

        <ol className={styles.stageList}>
          {props.stages.map((s, i) => {
            const open = s.id === active;
            return (
              <li
                key={s.id}
                className={`${styles.stageItem} ${open ? styles.stageItemOpen : ""}`}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`walkthrough-panel-${s.id}`}
                  onClick={() => setActive(s.id)}
                  className={styles.stageBtn}
                >
                  <span className={styles.stageN} aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.label}
                  <ChevronRight size={14} strokeWidth={2.25} aria-hidden className={styles.stageChevron} />
                </button>
                <div
                  id={`walkthrough-panel-${s.id}`}
                  role="region"
                  aria-label={s.label}
                  className={styles.stagePanel}
                >
                  <div className={styles.stagePanelInner}>
                    <p className={styles.stageBody}>{s.body}</p>
                    <ul className={styles.stageItems}>
                      {s.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <Link
          href={props.cta.href}
          prefetch={false}
          className={`${buttonVariants("primary", "md")} mt-7 w-fit`}
        >
          {props.cta.label}
          <ArrowRight size={15} strokeWidth={2.25} aria-hidden />
        </Link>
      </div>

      {/* ---- specimen ---- */}
      <div className={styles.specimen}>
        <div className={styles.specimenHead}>
          <span className={styles.specimenDot} aria-hidden />
          dbwhisper · {stage.label}
        </div>
        {/* Keyed remount restarts the entrance animation on every swap. */}
        <div key={stage.id} className={`${styles.specimenBody} ${styles.panelEnter}`} aria-live="polite">
          <Specimen {...props} stageId={stage.id} />
        </div>
      </div>
    </div>
  );
}

/** The active stage rendered as product UI. Pure presentation over props. */
function Specimen(props: WalkthroughProps & { stageId: WalkthroughStage["id"] }) {
  switch (props.stageId) {
    case "retrieve":
      return (
        <div>
          {props.schema.map((t) => (
            <div key={t.name} className={styles.specRow}>
              <CircleCheck
                className={styles.specMark}
                strokeWidth={2}
                aria-hidden
                style={t.selected ? undefined : { opacity: 0.25 }}
              />
              <span className={styles.specMono}>{t.name}</span>
              <span className={styles.specMeta}>
                {t.selected ? `matched · ${t.cols}` : t.cols}
              </span>
            </div>
          ))}
          {/* A horizontally scrollable well needs a tab stop and a name, or a
              keyboard-only reader cannot reach its end (WCAG 2.1.1). */}
          <div
            className={styles.specWell}
            tabIndex={0}
            role="region"
            aria-label="Retrieval call, scrollable"
          >
            {'search_tables("revenue by month") → orders, customers'}
          </div>
        </div>
      );

    case "generate":
      return (
        <div>
          <div
            className={styles.specWell}
            tabIndex={0}
            role="region"
            aria-label="Generated SQL, scrollable"
          >
            {props.sql}
          </div>
          <div className={styles.chips} aria-label="Provider fallback order">
            {props.providers.map((p, i) => (
              <span key={p} className={`${styles.chip} ${i === 0 ? styles.chipOn : ""}`}>
                {p}
                {i < props.providers.length - 1 ? (
                  <ChevronRight size={11} strokeWidth={2} aria-hidden className={styles.chipArrow} />
                ) : null}
              </span>
            ))}
          </div>
        </div>
      );

    case "validate":
      return (
        <div>
          {["SELECT-only", "Single statement", "Enrolled tables only"].map((check) => (
            <div key={check} className={styles.specRow}>
              <CircleCheck className={styles.specMark} strokeWidth={2} aria-hidden />
              <span className={styles.specMono}>{check}</span>
              <span className={styles.specMeta}>passed</span>
            </div>
          ))}
          <div className={styles.refusal}>
            <p className={styles.refusalRow}>
              <X className={styles.refusalMark} strokeWidth={2.5} aria-hidden />
              &ldquo;{props.refusalDemo.prompt}&rdquo; &mdash; {props.refusalDemo.verdict}
            </p>
            <p className={styles.refusalReason}>
              {props.refusalDemo.reason} · illustrative of validator behaviour
            </p>
          </div>
        </div>
      );

    case "execute":
      return (
        <div>
          <div
            className="overflow-x-auto rounded-[var(--radius-sm)] border border-border"
            tabIndex={0}
            role="region"
            aria-label="Result, scrollable"
          >
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  {props.columns.map((c) => (
                    <th
                      key={c}
                      scope="col"
                      className="border-b border-border bg-bg-subtle px-3 py-2 text-left font-mono text-[0.6875rem] font-medium uppercase tracking-[0.05em] text-ink-tertiary last:text-right"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {props.rows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, i) => (
                      <td
                        key={cell}
                        className={`border-b border-border px-3 py-1.5 font-mono tabular-nums last:border-b-0 ${
                          i === row.length - 1 ? "text-right text-ink" : "text-ink-secondary"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 flex items-center gap-2 font-mono text-[0.6875rem] text-ink-tertiary">
            <Check size={12} strokeWidth={3} aria-hidden className="text-positive" />
            {props.verdict} · {props.sampleLabel}
          </p>
        </div>
      );

    case "evaluate":
      return (
        <div>
          <dl className={styles.score}>
            {props.scores.map((s) => (
              <div key={s.label} className={styles.scoreCell}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-ink-secondary">
            Method, dates, and the excluded cases are on{" "}
            <Link href={props.registryHref} prefetch={false} className="link-underline text-accent">
              the registry
            </Link>
            .
          </p>
        </div>
      );
  }
}
