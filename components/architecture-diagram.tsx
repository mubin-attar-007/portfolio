"use client";

/**
 * ArchitectureDiagram — a reusable, data-driven interactive system diagram.
 *
 * NOT an image: nodes are HTML cards on a CSS grid, edges are an SVG overlay
 * measured from the live DOM, so it reflows responsively (and collapses to a
 * readable vertical stack on narrow screens). Hovering or focusing a node
 * highlights it and its incident edges + neighbors, so a reader can trace how
 * data flows. Fully keyboard-navigable and prefers-reduced-motion-safe.
 *
 * Accepts a typed { lanes, nodes, edges } spec (see lib/diagrams.ts).
 */

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "framer-motion";
import type { DiagramEdge, DiagramNode, DiagramSpec, NodeRole } from "@/lib/diagrams";

/* role → accent colour token (resolved to CSS custom properties). */
const ROLE_COLOR: Record<NodeRole, string> = {
  entry: "var(--color-cyan)",
  service: "var(--color-muted)",
  agent: "var(--color-accent)",
  guardrail: "var(--color-good)",
  store: "var(--color-data)",
  external: "var(--color-fire)",
};

const ROLE_RGB: Record<NodeRole, string> = {
  entry: "var(--rgb-cyan)",
  service: "148, 163, 184",
  agent: "var(--rgb-accent)",
  guardrail: "53, 224, 160",
  store: "var(--rgb-data)",
  external: "var(--rgb-fire)",
};

const ROLE_LABEL: Record<NodeRole, string> = {
  entry: "client",
  service: "service",
  agent: "core",
  guardrail: "guardrail",
  store: "data",
  external: "external",
};

type Point = { x: number; y: number };
type EdgeGeom = { edge: DiagramEdge; d: string; mid: Point };

export function ArchitectureDiagram({
  spec,
  caption,
}: {
  spec: DiagramSpec;
  caption?: string;
}) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [edges, setEdges] = useState<EdgeGeom[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [stacked, setStacked] = useState(false);
  const uid = useId().replace(/[:]/g, "");

  const laneCount = spec.lanes.length;
  const rowCount = useMemo(
    () => Math.max(...spec.nodes.map((n) => n.row)) + 1,
    [spec.nodes],
  );

  const setNodeRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) nodeRefs.current.set(id, el);
    else nodeRefs.current.delete(id);
  }, []);

  // Measure the wrapper + each node and recompute edge geometry. Runs in a
  // layout effect (refs are only safe to read post-render), and re-runs on
  // resize via a ResizeObserver. Edges route from a source's exit edge to a
  // target's entry edge with a smooth cubic; the midpoint carries the label.
  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const wb = wrap.getBoundingClientRect();
    const isStacked = wb.width < 680;
    setBox({ w: wb.width, h: wb.height });
    setStacked(isStacked);
    if (wb.width === 0) {
      setEdges([]);
      return;
    }

    const out: EdgeGeom[] = [];
    for (const edge of spec.edges) {
      const a = nodeRefs.current.get(edge.from);
      const b = nodeRefs.current.get(edge.to);
      if (!a || !b) continue;
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();

      let start: Point;
      let end: Point;
      let c1: Point;
      let c2: Point;

      if (isStacked) {
        // vertical flow: bottom of A → top of B
        start = { x: ra.left + ra.width / 2 - wb.left, y: ra.bottom - wb.top };
        end = { x: rb.left + rb.width / 2 - wb.left, y: rb.top - wb.top };
        const dy = (end.y - start.y) / 2;
        c1 = { x: start.x, y: start.y + dy };
        c2 = { x: end.x, y: end.y - dy };
      } else {
        // horizontal flow: right of A → left of B (fall back to vertical if the
        // target sits in the same/earlier lane)
        const leftToRight = rb.left >= ra.right - 4;
        if (leftToRight) {
          start = { x: ra.right - wb.left, y: ra.top + ra.height / 2 - wb.top };
          end = { x: rb.left - wb.left, y: rb.top + rb.height / 2 - wb.top };
          const dx = Math.max((end.x - start.x) / 2, 24);
          c1 = { x: start.x + dx, y: start.y };
          c2 = { x: end.x - dx, y: end.y };
        } else {
          start = { x: ra.left + ra.width / 2 - wb.left, y: ra.bottom - wb.top };
          end = { x: rb.left + rb.width / 2 - wb.left, y: rb.top - wb.top };
          const dy = (end.y - start.y) / 2;
          c1 = { x: start.x, y: start.y + dy };
          c2 = { x: end.x, y: end.y - dy };
        }
      }

      const d = `M ${start.x} ${start.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${end.x} ${end.y}`;
      const mid = {
        x: (start.x + c1.x + c2.x + end.x) / 4,
        y: (start.y + c1.y + c2.y + end.y) / 4,
      };
      out.push({ edge, d, mid });
    }
    setEdges(out);
  }, [spec.edges]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [measure]);

  // Which nodes/edges are "lit": the active node, its neighbors, incident edges.
  const litNodes = useMemo(() => {
    if (!active) return null;
    const set = new Set<string>([active]);
    for (const e of spec.edges) {
      if (e.from === active) set.add(e.to);
      if (e.to === active) set.add(e.from);
    }
    return set;
  }, [active, spec.edges]);

  const isEdgeLit = (e: DiagramEdge) =>
    active != null && (e.from === active || e.to === active);

  return (
    <figure className="archd not-prose my-2" aria-labelledby={caption ? `${uid}-cap` : undefined}>
      {/* lane headers */}
      {!stacked && (
        <div
          className="archd-lanes"
          style={{ gridTemplateColumns: `repeat(${laneCount}, minmax(0, 1fr))` }}
          aria-hidden
        >
          {spec.lanes.map((lane) => (
            <span key={lane} className="archd-lane-label">
              {lane}
            </span>
          ))}
        </div>
      )}

      <div
        ref={wrapRef}
        className="archd-grid"
        style={
          stacked
            ? undefined
            : {
                gridTemplateColumns: `repeat(${laneCount}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rowCount}, auto)`,
              }
        }
        role="group"
        aria-label="System architecture diagram"
      >
        {/* SVG edge overlay (behind the nodes) */}
        {box.w > 0 && (
          <svg
            className="archd-edges"
            width={box.w}
            height={box.h}
            viewBox={`0 0 ${box.w} ${box.h}`}
            aria-hidden
          >
            <defs>
              <marker
                id={`${uid}-arrow`}
                markerWidth="7"
                markerHeight="7"
                refX="5.5"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L6,3 L0,6 Z" fill="var(--color-line2)" />
              </marker>
              <marker
                id={`${uid}-arrow-lit`}
                markerWidth="7"
                markerHeight="7"
                refX="5.5"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L6,3 L0,6 Z" fill="var(--color-accent)" />
              </marker>
            </defs>
            {edges.map(({ edge, d }, i) => {
              const lit = isEdgeLit(edge);
              return (
                <path
                  key={`${edge.from}-${edge.to}-${i}`}
                  d={d}
                  fill="none"
                  className={lit ? "archd-edge is-lit" : "archd-edge"}
                  strokeDasharray={edge.variant === "dashed" ? "5 5" : undefined}
                  markerEnd={`url(#${uid}-${lit ? "arrow-lit" : "arrow"})`}
                />
              );
            })}
          </svg>
        )}

        {/* edge labels (HTML, positioned at midpoints, above the wires) */}
        {!reduce &&
          edges.map(({ edge, mid }, i) =>
            edge.label ? (
              <span
                key={`lbl-${edge.from}-${edge.to}-${i}`}
                className={isEdgeLit(edge) ? "archd-elabel is-lit" : "archd-elabel"}
                style={{ left: mid.x, top: mid.y }}
              >
                {edge.label}
              </span>
            ) : null,
          )}

        {/* nodes */}
        {spec.nodes.map((node) => (
          <Node
            key={node.id}
            node={node}
            stacked={stacked}
            active={active}
            dimmed={litNodes != null && !litNodes.has(node.id)}
            setRef={setNodeRef}
            onEnter={() => setActive(node.id)}
            onLeave={() => setActive((cur) => (cur === node.id ? null : cur))}
          />
        ))}
      </div>

      {/* legend */}
      <div className="archd-legend" aria-hidden>
        {(["entry", "agent", "guardrail", "store", "external"] as NodeRole[]).map((r) => (
          <span key={r} className="archd-legend-item">
            <span
              className="archd-dot"
              style={{ background: ROLE_COLOR[r], boxShadow: `0 0 8px -1px rgba(${ROLE_RGB[r]}, 0.7)` }}
            />
            {ROLE_LABEL[r]}
          </span>
        ))}
      </div>

      {caption && (
        <figcaption id={`${uid}-cap`} className="archd-caption">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ------------------------------------------------------------------ Node */

function Node({
  node,
  stacked,
  active,
  dimmed,
  setRef,
  onEnter,
  onLeave,
}: {
  node: DiagramNode;
  stacked: boolean;
  active: string | null;
  dimmed: boolean;
  setRef: (id: string, el: HTMLElement | null) => void;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const isActive = active === node.id;
  const rgb = ROLE_RGB[node.role];
  const color = ROLE_COLOR[node.role];

  return (
    <div
      ref={(el) => setRef(node.id, el)}
      className="archd-node"
      data-active={isActive || undefined}
      data-dimmed={dimmed || undefined}
      data-role={node.role}
      tabIndex={0}
      style={
        stacked
          ? { ["--nrgb" as string]: rgb, ["--nclr" as string]: color }
          : {
              gridColumn: node.lane + 1,
              gridRow: node.row + 1,
              ["--nrgb" as string]: rgb,
              ["--nclr" as string]: color,
            }
      }
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      <span className="archd-node-top">
        <span className="archd-node-dot" aria-hidden />
        {node.kicker && <span className="archd-node-kicker">{node.kicker}</span>}
      </span>
      <span className="archd-node-label">{node.label}</span>
      {node.detail && <span className="archd-node-detail">{node.detail}</span>}
    </div>
  );
}
