"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, CircleCheck, Pause, Play, RotateCcw, X } from "lucide-react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
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
 * Height animation is the recorded 0fr→1fr disclosure exception; the swap
 * collapses to instant under reduced motion via the global rule.
 *
 * ANNOUNCEMENTS ARE USER-DRIVEN ONLY, and this is the rule that matters most
 * here. The specimen body used to be `aria-live="polite"` itself, which was
 * right while a click was the only thing that could change it. Once the run
 * advances on its own, that same markup re-announces the ENTIRE panel — schema
 * rows, SQL, results — five times in fourteen seconds, unprompted. And polite
 * regions queue rather than replace, so the listener hears a backlog long after
 * the animation finished.
 *
 * So: the panel is not a live region at all, and a small visually-hidden status
 * region carries a one-line summary instead ("Stage 3 of 5: Validate"), updated
 * ONLY when the visitor drove the change. Automatic advancement is decorative
 * motion, and decorative motion is not announced.
 *
 * The refusal example is illustrative of real validator behaviour and the
 * specimen says so — it is not presented as a logged incident.
 */
/** How long one stage holds before the run advances. */
const DWELL_MS = 2800;

export function FlagshipWalkthrough(props: WalkthroughProps) {
  const [active, setActive] = useState<WalkthroughStage["id"]>("retrieve");
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  /** Only a visitor-initiated change is announced (see the A11y note above). */
  const [announced, setAnnounced] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const stage = props.stages.find((s) => s.id === active) ?? props.stages[0]!;
  const index = props.stages.findIndex((s) => s.id === stage.id);
  const last = index === props.stages.length - 1;

  /** Any manual selection stops the run — the reader has taken over. */
  const select = useCallback(
    (id: WalkthroughStage["id"]) => {
      setPlaying(false);
      setActive(id);
      const i = props.stages.findIndex((x) => x.id === id);
      const picked = props.stages[i];
      if (picked) setAnnounced(`Stage ${i + 1} of ${props.stages.length}: ${picked.label}`);
    },
    [props.stages],
  );

  const replay = useCallback(() => {
    setActive(props.stages[0]!.id);
    setPlaying(true);
    // The run itself is silent, so the announcement describes the ACTION rather
    // than narrating each stage the visitor is about to be shown.
    setAnnounced("Replaying the pipeline from stage 1.");
  }, [props.stages]);

  // The run starts ONCE, when the section is first reached — not on load,
  // where it would finish unseen, and not on every re-entry, which would make
  // scrolling past feel like the page was resetting itself.
  useEffect(() => {
    if (reduced || started) return;
    const el = rootRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          setStarted(true);
          setPlaying(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, started]);

  // Advance while playing; stop AT the last stage rather than looping — a
  // pipeline that runs forever is an animation, not a demonstration.
  //
  // The terminal state is derived (`last`), never set: writing state from
  // inside this effect would schedule a cascading render on the frame the run
  // ends. The transport reads `last` directly to become a Replay control.
  useEffect(() => {
    if (!playing || reduced || last) return;
    const id = setTimeout(() => {
      setActive(props.stages[index + 1]!.id);
    }, DWELL_MS);
    return () => clearTimeout(id);
  }, [playing, reduced, index, last, props.stages]);

  // A backgrounded tab should not keep stepping.
  useEffect(() => {
    const onHide = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  /**
   * Keyboard focus reaching the rail stops the run.
   *
   * Tabbing to a stage button does not activate it, so without this the run
   * keeps advancing and flips `aria-expanded` on the control the visitor is
   * currently focused on — the state of the thing under their cursor changing
   * by itself. Clicking already stops the run via select(); this covers the
   * visitor who arrives by keyboard and has not committed to a stage yet.
   */
  const stopForFocus = useCallback(() => setPlaying(false), []);

  return (
    <div className={styles.layout} ref={rootRef}>
      {/* ---- rail ---- */}
      <div className={styles.rail}>
        <EyebrowChip>{props.eyebrow}</EyebrowChip>
        <h2 id="walkthrough-title" className="mt-4 text-balance text-section font-bold text-ink">
          {props.title}
        </h2>
        <p className="mt-3 max-w-[42ch] text-pretty text-base text-ink-secondary">{props.body}</p>

        {/* The focus-pause belongs on the STAGE LIST, not on the rail.
            React's onFocus bubbles, and the transport lives in the rail too —
            so a rail-level handler fired on mousedown-focus of the Pause
            button, set playing=false, and then the click toggled it back to
            true. The Pause button resumed the run. Caught by
            "specimen: pause holds the active stage". */}
        <ol className={styles.stageList} onFocus={stopForFocus}>
          {props.stages.map((s, i) => {
            const open = s.id === active;
            return (
              <li
                key={s.id}
                className={`${styles.stageItem} ${open ? styles.stageItemOpen : ""} ${
                  open && playing && !last ? styles.stageItemPlaying : ""
                }`}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`walkthrough-panel-${s.id}`}
                  onClick={() => select(s.id)}
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

        {/* Transport. Small, and only meaningful while motion is allowed — under
            reduced motion there is no run to control, so the controls are not
            rendered at all rather than sitting there inert. */}
        {!reduced ? (
          <div className={styles.transport}>
            <button
              type="button"
              onClick={() => (last ? replay() : setPlaying((p) => !p))}
              className={styles.transportBtn}
            >
              {last ? (
                <>
                  <RotateCcw size={13} strokeWidth={2} aria-hidden />
                  Replay the run
                </>
              ) : playing ? (
                <>
                  <Pause size={13} strokeWidth={2} aria-hidden />
                  Pause
                </>
              ) : (
                <>
                  <Play size={13} strokeWidth={2} aria-hidden />
                  Play the run
                </>
              )}
            </button>
            <span className={styles.transportStep} aria-hidden>
              {index + 1} / {props.stages.length}
            </span>
          </div>
        ) : null}

        <Link
          href={props.cta.href}
          prefetch={false}
          className={`${buttonVariants("primary", "md")} mt-6 w-fit`}
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
          <span className={styles.specimenStep} aria-hidden>
            step {index + 1} of {props.stages.length}
          </span>
        </div>
        {/* Keyed remount restarts the entrance animation on every swap. NOT a
            live region — see the A11y note at the top of this file. */}
        <div key={stage.id} className={`${styles.specimenBody} ${styles.panelEnter}`}>
          <Specimen {...props} stageId={stage.id} />
        </div>
      </div>

      {/* The only live region: one line, and only for changes the visitor made.
          Rendered unconditionally so assistive tech has it registered before
          any text lands in it — a live region created at the same moment as its
          first content is unreliably announced. */}
      <p className="sr-only" role="status" aria-live="polite">
        {announced}
      </p>
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
