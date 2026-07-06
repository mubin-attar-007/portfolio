"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { DiagramSpec } from "./types";

/**
 * SystemDiagram — an interactive, keyboard-navigable architecture diagram
 * (ADR-005). HTML-in-SVG nodes on a col/row grid + orthogonal connectors,
 * computed from data (no DOM measurement → SSR-safe). Hover/focus a node to
 * reveal its description; arrow keys move between nodes. A visually-hidden
 * narration list is the text alternative for screen readers and no-JS.
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

export function SystemDiagram({ spec, caption }: { spec: DiagramSpec; caption?: string }) {
  const cols = Math.max(...spec.nodes.map((n) => n.col)) + 1;
  const rows = Math.max(...spec.nodes.map((n) => n.row)) + 1;
  const width = PAD * 2 + cols * NODE_W + (cols - 1) * GAP_X;
  const height = PAD * 2 + rows * NODE_H + (rows - 1) * GAP_Y;

  const byId = useMemo(
    () => Object.fromEntries(spec.nodes.map((n) => [n.id, n])),
    [spec.nodes],
  );
  const [active, setActive] = useState<string | null>(null);
  const activeNode = active ? byId[active] : null;
  const refs = useRef<(SVGGElement | null)[]>([]);

  const topLeft = (id: string) => {
    const n = byId[id];
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
    }
  }

  const isLit = (from: string, to: string) => active != null && (from === active || to === active);

  return (
    <figure className="my-6">
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-surface p-4">
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
                strokeDasharray={edge.dashed ? "4 4" : undefined}
                markerEnd={`url(#sd-arrow${lit ? "-lit" : ""})`}
                opacity={active && !lit ? 0.4 : 1}
              />
            );
          })}

          {spec.nodes.map((n, i) => {
            const p = topLeft(n.id);
            const on = active === n.id;
            return (
              <g
                key={n.id}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                tabIndex={0}
                role="button"
                aria-label={`${n.label}${n.sublabel ? `, ${n.sublabel}` : ""}. ${n.description}`}
                onMouseEnter={() => setActive(n.id)}
                onMouseLeave={() => setActive((a) => (a === n.id ? null : a))}
                onFocus={() => setActive(n.id)}
                onBlur={() => setActive((a) => (a === n.id ? null : a))}
                onKeyDown={(e) => onKey(e, i)}
                className="cursor-default outline-none [&:focus-visible>rect]:stroke-[var(--color-accent)]"
              >
                <rect
                  x={p.x}
                  y={p.y}
                  width={NODE_W}
                  height={NODE_H}
                  rx="8"
                  fill="var(--color-surface)"
                  stroke={on ? "var(--color-accent)" : "var(--color-border)"}
                  strokeWidth={on ? 1.5 : 1}
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
              </g>
            );
          })}
        </svg>
      </div>

      <div
        className="mt-3 min-h-12 rounded-[var(--radius-md)] border border-border bg-bg-subtle px-4 py-3 text-sm"
        aria-live="polite"
      >
        {activeNode ? (
          <>
            <span className="font-medium text-ink">{activeNode.label}</span>
            <span className="text-ink-secondary"> — {activeNode.description}</span>
          </>
        ) : (
          <span className="text-ink-tertiary">
            Hover or focus a node to trace how the system fits together.
          </span>
        )}
      </div>

      {/* text alternative / narration — screen readers and no-JS */}
      <ul className="sr-only">
        {spec.nodes.map((n) => (
          <li key={n.id}>
            {n.label}: {n.description}
          </li>
        ))}
      </ul>

      {caption ? <figcaption className="mt-2 text-sm text-ink-tertiary">{caption}</figcaption> : null}
    </figure>
  );
}
