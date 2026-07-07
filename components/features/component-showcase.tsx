"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { home } from "@/content/site";

/**
 * ComponentShowcase — a Clerk-Components-style split: a synced accordion of the
 * flagship's three real stages on the left, and an animated terminal that plays
 * up to the active stage on the right, over softly-blurred "ghost" panels. The
 * stage auto-advances until the visitor picks one, then holds. Reduced-motion:
 * everything is shown at once and nothing advances. A11y: accordion items are
 * real buttons with aria-expanded; the terminal is decorative (aria-hidden) and
 * mirrors the accordion, whose text carries the same information.
 */
const AUTO_MS = 2800;

type Block = { step: number; text: string; tone?: "prompt" | "ok" | "dim" | "sql" };

export function ComponentShowcase() {
  const { showcase, heroDemo } = home;
  const steps = showcase.steps;
  const [active, setActive] = useState(0);
  const [locked, setLocked] = useState(false); // user picked a stage → stop auto
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    // one-time read of the OS motion preference on mount (not a cascading render)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduced || locked) return;
    const iv = setInterval(() => setActive((a) => (a + 1) % steps.length), AUTO_MS);
    return () => clearInterval(iv);
  }, [reduced, locked, steps.length]);

  function pick(i: number) {
    setActive(i);
    setLocked(true);
  }

  // Reduced-motion holds on the final stage (full terminal), nothing advancing.
  const shownActive = reduced ? steps.length - 1 : active;

  // Terminal blocks, each tagged with the stage that reveals it (cumulative).
  const blocks: Block[] = [
    { step: 0, text: `▸ ${heroDemo.prompt}`, tone: "prompt" },
    { step: 0, text: heroDemo.steps[0], tone: "dim" },
    { step: 1, text: heroDemo.steps[1], tone: "dim" },
    ...heroDemo.sql.map((l): Block => ({ step: 2, text: l, tone: "sql" })),
    { step: 2, text: `✓ ${heroDemo.result}`, tone: "ok" },
  ];
  const visible = blocks.filter((b) => b.step <= shownActive);

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.06em] text-accent">{showcase.eyebrow}</p>
      <h2 className="mt-4 max-w-[20ch] text-3xl tracking-[-0.02em] text-ink sm:text-4xl">
        {showcase.title}
      </h2>
      <p className="mt-4 max-w-[54ch] text-lg text-ink-secondary">{showcase.body}</p>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16">
        {/* Left — the synced accordion */}
        <div>
          <ul className="flex flex-col">
            {steps.map((s, i) => {
              const on = i === shownActive;
              return (
                <li key={s.key}>
                  <button
                    type="button"
                    onClick={() => pick(i)}
                    aria-expanded={on}
                    className={`block w-full border-l-2 py-4 pl-5 text-left transition-colors ${
                      on ? "border-accent" : "border-border hover:border-border-strong"
                    }`}
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="font-mono text-xs tabular-nums text-ink-tertiary">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={on ? "font-medium text-ink" : "text-ink-secondary"}>
                        {s.label}
                      </span>
                    </span>
                    <span
                      className="grid transition-all duration-300 ease-[var(--ease-out)]"
                      style={{ gridTemplateRows: on ? "1fr" : "0fr" }}
                    >
                      <span className="overflow-hidden">
                        <span className="mt-2 block max-w-[42ch] pl-8 text-sm text-ink-secondary">
                          {s.body}
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <Link
            href={showcase.cta.href}
            className="group mt-8 inline-flex items-center gap-1.5 pl-5 text-sm font-medium text-accent hover:text-accent-hover"
          >
            {showcase.cta.label}
            <ArrowRight
              size={15}
              strokeWidth={1.5}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {/* Right — the animated terminal over blurred ghost panels */}
        <div className="relative" aria-hidden>
          {/* ghost panels, blurred + faded, echoing a stack of screens */}
          <div className="pointer-events-none absolute -right-3 -top-5 hidden h-full w-full rounded-[var(--radius-lg)] border border-border bg-surface/60 blur-[2px] sm:block [transform:rotate(1.4deg)]" />
          <div className="pointer-events-none absolute -left-3 top-4 hidden h-full w-full rounded-[var(--radius-lg)] border border-border bg-surface/50 blur-[3px] sm:block [transform:rotate(-1.6deg)]" />
          <figure className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-lg)]">
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <span className="font-mono text-xs text-ink-tertiary">{heroDemo.app}</span>
              <span className="rounded-[var(--radius-sm)] border border-border px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide text-ink-tertiary">
                {heroDemo.badge}
              </span>
            </div>
            <div className="min-h-[15rem] px-4 py-4 font-mono text-xs leading-relaxed">
              {visible.map((b, i) => {
                const last = i === visible.length - 1;
                const isActiveStep = b.step === shownActive;
                const color =
                  b.tone === "prompt"
                    ? "text-ink"
                    : b.tone === "ok"
                      ? "text-positive"
                      : b.tone === "sql"
                        ? "text-ink-secondary"
                        : "text-ink-tertiary";
                return (
                  <div
                    key={i}
                    className={`-mx-2 whitespace-pre rounded px-2 transition-colors ${color} ${
                      isActiveStep ? "bg-accent-subtle" : ""
                    }`}
                  >
                    {b.tone === "prompt" ? (
                      <>
                        <span className="text-accent">▸ </span>
                        {b.text.replace(/^▸ /, "")}
                      </>
                    ) : (
                      b.text
                    )}
                    {last && !reduced ? <span className="caret-blink text-accent">▋</span> : null}
                  </div>
                );
              })}
            </div>
          </figure>
        </div>
      </div>
    </div>
  );
}
