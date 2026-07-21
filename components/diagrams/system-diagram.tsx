"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { DiagramNode, DiagramSpec } from "./types";

/**
 * SystemDiagram — an interactive, keyboard-navigable architecture diagram
 * (ADR-005). HTML-in-SVG nodes on a col/row grid + orthogonal connectors,
 * computed from data (no DOM measurement → SSR-safe). Hover/focus previews a
 * node; click/Enter PINS it so its real engineering decision (why / instead-of
 * / tradeoff) stays open — this is what makes it explorable on touch too.
 * A visually-hidden narration list is the text alternative for SRs and no-JS.
 * Looks like technical documentation, not a product demo (DESIGN §3).
 *
 * A11y: roving tabindex — the whole diagram is ONE tab stop, and arrow keys /
 * Home / End move between nodes. Making every node tabbable would force a
 * keyboard user through the entire graph just to reach the next control.
 *
 * Depth: nodes are top-lit gradient surfaces with resting elevation, so they
 * read as cards sitting ON the band rather than outlines drawn into it; the
 * active node adds a lift and an accent glow. Connectors anchor to node EDGES
 * (not centres, which hid every arrowhead under the target) and turn through
 * rounded elbows. The active fill is deliberately NOT lightened — see the
 * .sd-node-* note in globals.css for the AA arithmetic.
 *
 * Performance: all state changes are transform / filter / opacity / colour, and
 * the geometry is computed from data, so nothing measures the DOM.
 */

// geometry (named constants — no magic numbers). These are SVG user units, not
// CSS pixels: the viewBox scales them, so they live here rather than in tokens.
const NODE_W = 188;
const NODE_H = 64;
const NODE_RX = 8;
const GAP_X = 64;
const GAP_Y = 76;
const PAD = 18;
const LABEL_SIZE = 13;
const SUB_SIZE = 10.5;
/** Corner radius of a connector's elbow — straight legs, rounded turns. */
const EDGE_R = 10;
/** Perpendicular separation between the two lines of a bidirectional pair. */
const EDGE_SEP = 9;

type Point = { x: number; y: number };

/**
 * Where a connector meets a node: its BOUNDARY, not its centre. Centre-to-centre
 * routing tucked every arrowhead underneath the target node — i.e. made it
 * invisible — which is why the graph read as loose lines rather than a wired
 * system. `offset` nudges the anchor along the node's edge so two edges between
 * the same pair (e.g. a call and its circuit-breaker return) do not overlap.
 */
function anchors(
  from: DiagramNode,
  to: DiagramNode,
  offset: number,
  topLeft: (n: DiagramNode) => Point,
): { a: Point; b: Point } {
  const fp = topLeft(from);
  const tp = topLeft(to);
  if (from.col === to.col) {
    const down = to.row > from.row;
    return {
      a: { x: fp.x + NODE_W / 2 + offset, y: down ? fp.y + NODE_H : fp.y },
      b: { x: tp.x + NODE_W / 2 + offset, y: down ? tp.y : tp.y + NODE_H },
    };
  }
  const right = to.col > from.col;
  return {
    a: { x: right ? fp.x + NODE_W : fp.x, y: fp.y + NODE_H / 2 + offset },
    b: { x: right ? tp.x : tp.x + NODE_W, y: tp.y + NODE_H / 2 + offset },
  };
}

/**
 * Orthogonal connector with rounded elbows. A right-angle corner is what makes a
 * hand-built diagram look hand-built; an arc through the turn is what makes it
 * look drawn. Straight runs short-circuit, and the radius is clamped to half the
 * shortest leg so two arcs can never overlap on a tight route.
 */
function elbowPath(a: Point, b: Point): string {
  const straight = `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  if (Math.abs(a.y - b.y) < 1 || Math.abs(a.x - b.x) < 1) return straight;

  const midX = (a.x + b.x) / 2;
  const dx1 = Math.sign(midX - a.x);
  const dx2 = Math.sign(b.x - midX);
  const dy = Math.sign(b.y - a.y);
  const r = Math.min(
    EDGE_R,
    Math.abs(midX - a.x),
    Math.abs(b.x - midX),
    Math.abs(b.y - a.y) / 2,
  );
  if (r < 1) return `M ${a.x} ${a.y} L ${midX} ${a.y} L ${midX} ${b.y} L ${b.x} ${b.y}`;

  return [
    `M ${a.x} ${a.y}`,
    `L ${midX - dx1 * r} ${a.y}`,
    `Q ${midX} ${a.y} ${midX} ${a.y + dy * r}`,
    `L ${midX} ${b.y - dy * r}`,
    `Q ${midX} ${b.y} ${midX + dx2 * r} ${b.y}`,
    `L ${b.x} ${b.y}`,
  ].join(" ");
}

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

  // On hover/pin, light the active node + its directly-connected neighbours and
  // dim the rest — so hovering a node traces its slice of the system (the Clerk/
  // Linear "focus the subsystem" hover), not just tints one box.
  const litNodes = useMemo(() => {
    if (!active) return null;
    const s = new Set<string>([active]);
    for (const e of spec.edges) {
      if (e.from === active) s.add(e.to);
      else if (e.to === active) s.add(e.from);
    }
    return s;
  }, [active, spec.edges]);
  const refs = useRef<(SVGGElement | null)[]>([]);

  // Roving tabindex: the index of the single node that carries tabIndex=0. It
  // follows focus, so tabbing back into the diagram returns to where the user
  // left off. Clamped in case a shorter spec renders — an out-of-range index
  // would leave NO tabbable node and make the diagram keyboard-unreachable.
  const [focusIdx, setFocusIdx] = useState(0);
  const rovingIdx = focusIdx < spec.nodes.length ? focusIdx : 0;
  const hintId = useId();
  // SVG <defs> live in a document-global id namespace, so two diagrams on one
  // page would fight over `#sd-arrow`. Strip the non-alphanumerics React's id
  // format carries (« » / :) so the value is safe inside a url(#…) reference.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  const nodeAt = (id: string) => byId[id]!; // ids always come from spec.nodes
  const topLeft = (n: DiagramNode): Point => ({
    x: PAD + n.col * (NODE_W + GAP_X),
    y: PAD + n.row * (NODE_H + GAP_Y),
  });

  // Two edges between the same pair of nodes (a call and its circuit-breaker
  // return, say) would otherwise be drawn exactly on top of each other. Fan the
  // members of each pair symmetrically about the shared axis.
  const edgeOffsets = useMemo(() => {
    const groups = new Map<string, number[]>();
    spec.edges.forEach((e, i) => {
      const key = [e.from, e.to].sort().join("|");
      const list = groups.get(key);
      if (list) list.push(i);
      else groups.set(key, [i]);
    });
    const out = new Array<number>(spec.edges.length).fill(0);
    for (const list of groups.values()) {
      if (list.length < 2) continue;
      list.forEach((edgeIdx, k) => {
        out[edgeIdx] = (k - (list.length - 1) / 2) * EDGE_SEP;
      });
    }
    return out;
  }, [spec.edges]);

  function onKey(e: KeyboardEvent<SVGGElement>, i: number) {
    const n = spec.nodes.length;
    // Moving focus is enough to rove the tab stop: each node's onFocus records
    // its index, so there is one source of truth for "which node is tabbable".
    const move = (to: number) => {
      e.preventDefault();
      refs.current[to]?.focus();
    };
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      move((i + 1) % n);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      move((i - 1 + n) % n);
    } else if (e.key === "Home") {
      move(0);
    } else if (e.key === "End") {
      move(n - 1);
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
      {/* On phones the graph keeps its NATIVE size and the bordered container
          scrolls, so node labels stay legible instead of shrinking to ~5px to
          fit a 360px viewport. It scales-to-fit only from md up (where it fits). */}
      <p className="mb-2 font-mono text-xs text-ink-tertiary md:hidden">Swipe the diagram to explore →</p>
      {/* The canvas is bg-subtle, NOT surface. Surface-on-surface was the real
          reason the graph read flat: the nodes were exactly the same colour as
          the panel they sat on, so only their 1px outline distinguished them.
          bg-subtle puts a step between canvas and node in both themes (#eeeef0
          under white; #1a1a1f under #212126) and gives the resting drop-shadow
          something to fall onto. shadow-md, not -sm: on the dark band this frame
          is the flagship object on the page and should sit above it. */}
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-bg-subtle p-4 shadow-[var(--shadow-md)]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          className="h-auto md:max-w-full"
          role="group"
          aria-label={caption ?? "System architecture diagram"}
          aria-describedby={hintId}
        >
          <defs>
            {/* FILLED triangles, not stroked chevrons: at ~8px on screen an open
                chevron's two 1.2px strokes half-dissolve into the band and the
                edge appears to end in a smudge. A solid head keeps a crisp point
                at any rendered size — it is why Clerk's connector terminals read
                as drawn rather than sketched. refX sits at the tip so the head
                touches the node edge exactly where the path ends. */}
            <marker
              id={`${uid}-arrow`}
              markerWidth="9"
              markerHeight="9"
              refX="7"
              refY="4.5"
              orient="auto"
            >
              <path d="M0,1 L7,4.5 L0,8 Z" fill="var(--color-border-strong)" />
            </marker>
            <marker
              id={`${uid}-arrow-lit`}
              markerWidth="9"
              markerHeight="9"
              refX="7"
              refY="4.5"
              orient="auto"
            >
              <path d="M0,1 L7,4.5 L0,8 Z" fill="var(--color-accent)" />
            </marker>
            {/* Top-lit card surface. Stops carry their colour from globals.css so
                the whole thing is token-derived and adapts to the dark band. */}
            <linearGradient id={`${uid}-node`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className="sd-node-top" />
              <stop offset="52%" className="sd-node-base" />
              <stop offset="100%" className="sd-node-base" />
            </linearGradient>
          </defs>

          {spec.edges.map((edge, i) => {
            const lit = isLit(edge.from, edge.to);
            const { a, b } = anchors(
              nodeAt(edge.from),
              nodeAt(edge.to),
              edgeOffsets[i] ?? 0,
              topLeft,
            );
            return (
              <path
                key={`${edge.from}-${edge.to}-${i}`}
                d={elbowPath(a, b)}
                fill="none"
                strokeLinecap="round"
                stroke={lit ? "var(--color-accent)" : "var(--color-border-strong)"}
                strokeWidth={lit ? 1.6 : 1.2}
                // active edges show a flowing "current"; others keep their style
                strokeDasharray={lit ? "6 4" : edge.dashed ? "4 4" : undefined}
                className={lit ? "sd-flow" : undefined}
                markerEnd={`url(#${uid}-arrow${lit ? "-lit" : ""})`}
                opacity={active && !lit ? 0.35 : 1}
                style={{
                  transition:
                    "stroke var(--motion-base) var(--ease-out), opacity var(--motion-base) var(--ease-out)",
                }}
              />
            );
          })}

          {spec.nodes.map((n, i) => {
            const p = topLeft(n);
            const on = active === n.id;
            const isPinned = pinned === n.id;
            const dimmed = litNodes != null && !litNodes.has(n.id);
            return (
              <g
                key={n.id}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                tabIndex={i === rovingIdx ? 0 : -1}
                role="button"
                aria-pressed={n.decision ? isPinned : undefined}
                aria-label={`${n.label}${n.sublabel ? `, ${n.sublabel}` : ""}. ${n.description}${
                  !compact && n.decision?.why ? ` Why: ${n.decision.why}` : ""
                }`}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover((h) => (h === n.id ? null : h))}
                onFocus={() => {
                  setHover(n.id);
                  setFocusIdx(i);
                }}
                onBlur={() => setHover((h) => (h === n.id ? null : h))}
                onClick={() => n.decision && setPinned((pv) => (pv === n.id ? null : n.id))}
                onKeyDown={(e) => onKey(e, i)}
                className={`outline-none [&:focus-visible>rect]:stroke-[var(--color-accent)] ${
                  n.decision ? "cursor-pointer" : "cursor-default"
                }`}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  transform: on ? "scale(1.05)" : "scale(1)",
                  // Every node carries resting elevation so it reads as a card
                  // ON the band; the active one gains the full lift plus an
                  // accent glow. Depth is the state signal, not decoration.
                  filter: on ? "var(--drop-node) var(--drop-node-glow)" : "var(--drop-node-rest)",
                  opacity: dimmed ? 0.4 : 1,
                  transition:
                    "transform var(--motion-base) var(--ease-out), filter var(--motion-base) var(--ease-out), opacity var(--motion-base) var(--ease-out)",
                }}
              >
                <rect
                  x={p.x}
                  y={p.y}
                  width={NODE_W}
                  height={NODE_H}
                  rx={NODE_RX}
                  // The ACTIVE fill stays the flat accent-subtle token on purpose
                  // — lightening it drops the sublabel under AA on the dark band
                  // (see the .sd-node-* note in globals.css).
                  fill={isPinned || on ? "var(--color-accent-subtle)" : `url(#${uid}-node)`}
                  stroke={
                    on
                      ? "var(--color-accent)"
                      : isPinned
                        ? "var(--color-border-strong)"
                        : "var(--color-border)"
                  }
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
                    // h-6 clears the 24×24 minimum target size (WCAG 2.5.8)
                    className="inline-flex h-6 shrink-0 items-center rounded-[var(--radius-sm)] font-mono text-xs text-ink-tertiary hover:text-ink"
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

      {/* With one tab stop for the whole graph, the other nodes are only
          reachable by arrow key — so say so. Described by the <svg> above. */}
      <p id={hintId} className="sr-only">
        Use the arrow keys, Home, or End to move between nodes. Press Enter or Space to pin a
        node&apos;s decision, and Escape to release it.
      </p>

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
