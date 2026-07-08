"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { DiagramSpec } from "./types";

/**
 * SystemDiagram — an interactive, keyboard-navigable architecture diagram
 * (ADR-005). HTML-in-SVG nodes on a col/row grid + orthogonal connectors,
 * computed from data (no DOM measurement → SSR-safe). Hover/focus previews a
 * node; click/Enter PINS it so its real engineering decision (why / instead-of
 * / tradeoff) stays open — this is what makes it explorable on touch too.
 * A visually-hidden narration list is the text alternative for SRs and no-JS.
 * Looks like technical documentation, not a product demo (DESIGN §3).
 */

// geometry (named constants — no magic numbers)
const NODE_W = 188;
const NODE_H = 64;
const GAP_X = 64;
const GAP_Y = 76;
const PAD = 18;
const LABEL_SIZE = 13;
const SUB_SIZE = 10.5;

export function SystemDiagram({
  spec,
  caption,
  compact = false,
  deepLink = "/work/dbwhisper",
}: {
  spec: DiagramSpec;
  caption?: string;
  /** Homepage: short reveal (1–2 lines) + deep link. Case study: full decision essays. */
  compact?: boolean;
  deepLink?: string;
}) {
  const cols = Math.max(...spec.nodes.map((n) => n.col)) + 1;
  const rows = Math.max(...spec.nodes.map((n) => n.row)) + 1;
  const width = PAD * 2 + cols * NODE_W + (cols - 1) * GAP_X;
  const height = PAD * 2 + rows * NODE_H + (rows - 1) * GAP_Y;

  const byId = useMemo(
    () => Object.fromEntries(spec.nodes.map((n) => [n.id, n])),
    [spec.nodes],
  );
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const active = hover ?? pinned; // what lights the graph
  const shownId = pinned ?? hover; // what the panel shows
  const shown = shownId ? byId[shownId] : null;
  const hasDecisions = spec.nodes.some((n) => n.decision);
  const refs = useRef<(SVGGElement | null)[]>([]);

  const topLeft = (id: string) => {
    const n = byId[id]!; // ids always come from spec.nodes
    return { x: PAD + n.col * (NODE_W + GAP_X), y: PAD + n.row * (NODE_H + GAP_Y) };
  };
  const center = (id: string) => {
    const p = topLeft(id);
    return { x: p.x + NODE_W / 2, y: p.y + NODE_H / 2 };
  };

  function onKey(e: KeyboardEvent<SVGGElement>, i: number) {
    const n = spec.nodes.length;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      refs.current[(i + 1) % n]?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      refs.current[(i - 1 + n) % n]?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const id = spec.nodes[i]!.id; // i is a valid node index
      setPinned((p) => (p === id ? null : id));
    } else if (e.key === "Escape") {
      setPinned(null);
    }
  }

  const isLit = (from: string, to: string) => active != null && (from === active || to === active);

  return (
    <figure className="my-6">
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-[var(--shadow-sm)]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          className="h-auto max-w-full"
          role="group"
          aria-label={caption ?? "System architecture diagram"}
        >
          <defs>
            <marker id="sd-arrow" markerWidth="9" markerHeight="9" refX="7.5" refY="4.5" orient="auto">
              <path d="M0,1 L7,4.5 L0,8" fill="none" stroke="var(--color-border-strong)" strokeWidth="1.2" />
            </marker>
            <marker id="sd-arrow-lit" markerWidth="9" markerHeight="9" refX="7.5" refY="4.5" orient="auto">
              <path d="M0,1 L7,4.5 L0,8" fill="none" stroke="var(--color-accent)" strokeWidth="1.4" />
            </marker>
          </defs>

          {spec.edges.map((edge, i) => {
            const a = center(edge.from);
            const b = center(edge.to);
            const lit = isLit(edge.from, edge.to);
            const midX = (a.x + b.x) / 2;
            const d = `M ${a.x} ${a.y} L ${midX} ${a.y} L ${midX} ${b.y} L ${b.x} ${b.y}`;
            return (
              <path
                key={`${edge.from}-${edge.to}-${i}`}
                d={d}
                fill="none"
                stroke={lit ? "var(--color-accent)" : "var(--color-border-strong)"}
                strokeWidth={lit ? 1.6 : 1.2}
                // active edges show a flowing "current"; others keep their style
                strokeDasharray={lit ? "6 4" : edge.dashed ? "4 4" : undefined}
                className={lit ? "sd-flow" : undefined}
                markerEnd={`url(#sd-arrow${lit ? "-lit" : ""})`}
                opacity={active && !lit ? 0.4 : 1}
              />
            );
          })}

          {spec.nodes.map((n, i) => {
            const p = topLeft(n.id);
            const on = active === n.id;
            const isPinned = pinned === n.id;
            return (
              <g
                key={n.id}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                tabIndex={0}
                role="button"
                aria-pressed={n.decision ? isPinned : undefined}
                aria-label={`${n.label}${n.sublabel ? `, ${n.sublabel}` : ""}. ${n.description}${
                  !compact && n.decision?.why ? ` Why: ${n.decision.why}` : ""
                }`}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover((h) => (h === n.id ? null : h))}
                onFocus={() => setHover(n.id)}
                onBlur={() => setHover((h) => (h === n.id ? null : h))}
                onClick={() => n.decision && setPinned((pv) => (pv === n.id ? null : n.id))}
                onKeyDown={(e) => onKey(e, i)}
                className={`outline-none [&:focus-visible>rect]:stroke-[var(--color-accent)] ${
                  n.decision ? "cursor-pointer" : "cursor-default"
                }`}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  transform: on ? "scale(1.035)" : "scale(1)",
                  filter: on ? "var(--drop-node)" : "none",
                  transition:
                    "transform var(--motion-base) var(--ease-out), filter var(--motion-base) var(--ease-out)",
                }}
              >
                <rect
                  x={p.x}
                  y={p.y}
                  width={NODE_W}
                  height={NODE_H}
                  rx="8"
                  fill={isPinned || on ? "var(--color-accent-subtle)" : "var(--color-surface)"}
                  stroke={on ? "var(--color-accent)" : "var(--color-border)"}
                  strokeWidth={on ? 1.5 : 1}
                  style={{
                    transition:
                      "fill var(--motion-base) var(--ease-out), stroke var(--motion-base) var(--ease-out), stroke-width var(--motion-base) var(--ease-out)",
                  }}
                />
                <text
                  x={p.x + 14}
                  y={p.y + (n.sublabel ? 26 : 38)}
                  fill="var(--color-ink)"
                  className="font-sans"
                  style={{ fontSize: LABEL_SIZE, fontWeight: 500 }}
                >
                  {n.label}
                </text>
                {n.sublabel ? (
                  <text
                    x={p.x + 14}
                    y={p.y + 44}
                    fill="var(--color-ink-tertiary)"
                    className="font-mono"
                    style={{ fontSize: SUB_SIZE }}
                  >
                    {n.sublabel}
                  </text>
                ) : null}
                {/* affordance: a small accent tick marks an explorable node */}
                {n.decision ? (
                  <circle
                    cx={p.x + NODE_W - 13}
                    cy={p.y + 13}
                    r="3"
                    fill={on ? "var(--color-accent)" : "var(--color-border-strong)"}
                  />
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      {hasDecisions ? (
        <p className="mt-3 font-mono text-xs text-ink-tertiary">
          Hover a node to preview · click one to see the decision behind it
        </p>
      ) : null}

      <div
        className="mt-2 min-h-[7rem] rounded-[var(--radius-md)] border border-border bg-bg-subtle px-4 py-3 text-sm"
        aria-live="polite"
      >
        {shown ? (
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-medium text-ink">{shown.label}</span>
              {shown.decision ? (
                pinned === shown.id ? (
                  <button
                    type="button"
                    onClick={() => setPinned(null)}
                    className="shrink-0 font-mono text-xs text-ink-tertiary hover:text-ink"
                  >
                    release ✕
                  </button>
                ) : (
                  <span className="shrink-0 font-mono text-xs text-ink-tertiary">click to pin</span>
                )
              ) : null}
            </div>
            <p className="mt-1 text-ink-secondary">{shown.description}</p>
            {/* Homepage (compact): 1–2 line reveal + deep link. The full
                Instead-of/Why/Tradeoff essays live on the case study (fixes V2). */}
            {shown.decision && compact ? (
              <Link
                href={deepLink}
                className="group mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
              >
                Read the decision behind {shown.label}
                <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>
                  →
                </span>
              </Link>
            ) : null}
            {shown.decision && !compact ? (
              <dl className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                {shown.decision.rejected ? (
                  <div className="grid gap-0.5 sm:grid-cols-[6.5rem_1fr] sm:gap-3">
                    <dt className="font-mono text-xs text-ink-tertiary">Instead of</dt>
                    <dd className="text-ink-secondary">{shown.decision.rejected}</dd>
                  </div>
                ) : null}
                {shown.decision.why ? (
                  <div className="grid gap-0.5 sm:grid-cols-[6.5rem_1fr] sm:gap-3">
                    <dt className="font-mono text-xs text-ink-tertiary">Why</dt>
                    <dd className="text-ink-secondary">{shown.decision.why}</dd>
                  </div>
                ) : null}
                {shown.decision.tradeoff ? (
                  <div className="grid gap-0.5 sm:grid-cols-[6.5rem_1fr] sm:gap-3">
                    <dt className="font-mono text-xs text-ink-tertiary">Tradeoff</dt>
                    <dd className="text-ink-secondary">{shown.decision.tradeoff}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
          </div>
        ) : (
          <span className="text-ink-tertiary">
            {hasDecisions
              ? "Hover or focus a node to trace the system — click one to read the decision behind it."
              : "Hover or focus a node to trace how the system fits together."}
          </span>
        )}
      </div>

      {/* Text alternative / narration — screen readers and no-JS. On the compact
          homepage it narrates only the map (label + description); the full
          decision essays (why/instead-of/tradeoff) live on the case study
          (!compact), so they aren't duplicated into the homepage DOM (fixes V2). */}
      <ul className="sr-only">
        {spec.nodes.map((n) => (
          <li key={n.id}>
            {n.label}: {n.description}
            {!compact && n.decision?.why ? ` Why: ${n.decision.why}` : ""}
            {!compact && n.decision?.rejected ? ` Instead of: ${n.decision.rejected}.` : ""}
            {!compact && n.decision?.tradeoff ? ` Tradeoff: ${n.decision.tradeoff}` : ""}
          </li>
        ))}
      </ul>

      {caption ? <figcaption className="mt-2 text-sm text-ink-tertiary">{caption}</figcaption> : null}
    </figure>
  );
}
