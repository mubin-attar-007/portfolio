"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { home } from "@/content/site";

/**
 * HeroTerminal — the site's signature "wow": a representative DBWhisper request
 * that types itself, then reveals retrieve → validate → read-only SQL → result,
 * holds, and loops (~10s). Pauses on hover, replays on click, and renders the
 * full static state under prefers-reduced-motion. Driven by a self-scheduling
 * effect (each state advance schedules the next; `paused` stops scheduling) — no
 * timers to leak. A11y: <figure> with a caption; the loop is decorative and the
 * final state is the meaningful one, so it's aria-hidden with an sr-only summary.
 */
const TYPE_MS = 46; // per prompt char
const STEP_MS = 620; // between revealed lines
const HOLD_MS = 3200; // dwell on the finished frame before looping

type Block = { text: string; tone: "dim" | "sql" | "ok" };

export function HeroTerminal() {
  const d = home.heroDemo;
  const blocks: Block[] = [
    ...d.steps.map((t): Block => ({ text: t, tone: "dim" })),
    ...d.sql.map((t): Block => ({ text: t, tone: "sql" })),
    { text: d.result, tone: "ok" },
  ];

  // Start FULL so the server-rendered HTML already contains the terminal content
  // (good for LCP + no first-paint flash). The driver's "done" branch then holds
  // and loops (full → hold → reset → type → …).
  const [typed, setTyped] = useState(d.prompt.length);
  const [revealed, setRevealed] = useState(blocks.length);
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // one-time read of the OS motion preference on mount (not a cascading render)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // reduced-motion → render the full static frame (driver effect stays idle below)
  const shownTyped = reduced ? d.prompt.length : typed;
  const shownRevealed = reduced ? blocks.length : revealed;

  // self-scheduling driver: pick the next advance from the current state
  useEffect(() => {
    if (reduced || paused) return;
    let ms: number;
    let next: () => void;
    if (typed < d.prompt.length) {
      ms = TYPE_MS;
      next = () => setTyped((t) => t + 1);
    } else if (revealed < blocks.length) {
      ms = revealed === 0 ? 520 : STEP_MS;
      next = () => setRevealed((r) => r + 1);
    } else {
      ms = HOLD_MS;
      next = () => {
        setTyped(0);
        setRevealed(0);
      };
    }
    const id = setTimeout(next, ms);
    return () => clearTimeout(id);
  }, [typed, revealed, reduced, paused, d.prompt.length, blocks.length]);

  return (
    <figure
      className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-md)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onClick={() => {
        setTyped(0);
        setRevealed(0);
        setPaused(false);
      }}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="font-mono text-xs text-ink-tertiary">{d.app}</span>
        <span className="rounded-[var(--radius-sm)] border border-border px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide text-ink-tertiary">
          {d.badge}
        </span>
      </div>
      <div className="min-h-[15rem] px-4 py-4 font-mono text-xs leading-relaxed" aria-hidden>
        <div className="flex gap-2">
          <span className="text-accent">▸</span>
          <span className="text-ink">
            {d.prompt.slice(0, shownTyped)}
            {!reduced ? <span className="caret-blink text-accent">▋</span> : null}
          </span>
        </div>
        <div className="mt-3 flex flex-col gap-0.5">
          {blocks.slice(0, shownRevealed).map((b, i) => (
            <div
              key={i}
              className={
                b.tone === "ok"
                  ? "mt-2 flex items-center gap-1.5 text-ink"
                  : b.tone === "sql"
                    ? "whitespace-pre text-ink-secondary"
                    : "text-ink-tertiary"
              }
            >
              {b.tone === "ok" ? (
                <>
                  <Check size={13} strokeWidth={2} className="text-positive" aria-hidden />
                  <span>{b.text}</span>
                </>
              ) : (
                b.text
              )}
            </div>
          ))}
        </div>
      </div>
      <figcaption className="border-t border-border px-4 py-2 font-mono text-[0.7rem] text-ink-tertiary">
        {d.note}
      </figcaption>
      <p className="sr-only">
        Example DBWhisper request: “{d.prompt}”. It retrieves the schema, validates the query as
        read-only, runs it, and returns {d.result}.
      </p>
    </figure>
  );
}
