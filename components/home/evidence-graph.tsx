import styles from "./evidence-graph.module.css";

/**
 * EvidenceGraph — the site's original background motif.
 *
 * It is a drawing of the argument the site makes: a request is routed through
 * RETRIEVE → VALIDATE → EXECUTE → MEASURE, one branch is refused before it can
 * run, and the whole thing sits in a field of other routes that were not taken.
 * Angular traces, small nodes, square checkpoints, and four faint stage labels.
 *
 * Deliberately not: a mesh gradient, an orb, a particle field, or a circuit
 * board. Those are decoration; this is a diagram that happens to be quiet.
 *
 * Geometry: one fixed 1440×640 viewBox with `preserveAspectRatio="xMidYMid
 * slice"`, so the drawing crops rather than distorts at any container ratio, and
 * a CSS radial mask removes it from underneath the copy entirely. Roughly 40
 * nodes total — cheap enough to paint on a phone, and no canvas or runtime.
 *
 * A11y: entirely decorative, so the wrapper is `aria-hidden` and nothing inside
 * is reachable or announced. The four labels are drawn text, not information —
 * the same four stages are named in prose in the flagship section below.
 *
 * @param variant `hero` is the full-strength drawing; `quiet` drops the trace
 *                weights and widens the mask for the closing CTA plate, where
 *                the artwork only has to imply depth behind a headline.
 */
export function EvidenceGraph({ variant = "hero" }: { variant?: "hero" | "quiet" }) {
  /**
   * The primary route. Written as one continuous path (rather than four joined
   * segments) so the travelling pulse below can share the exact same `d` and
   * follow the route without a second set of coordinates to keep in sync.
   */
  const PRIMARY =
    "M -40 520 H 150 L 210 460 H 380 L 440 400 H 700 L 760 340 H 1000 L 1060 280 H 1320 L 1380 220 H 1480";

  // `dy` places each label clear of the centre mask: validate's node sits at
  // the fade's edge, and a label half-swallowed by the mask read as a misprint,
  // so it hangs below its node instead of above.
  const NODES: { x: number; y: number; dy: number; label: string }[] = [
    { x: 210, y: 460, dy: -16, label: "retrieve" },
    { x: 440, y: 400, dy: 28, label: "validate" },
    { x: 760, y: 340, dy: -16, label: "execute" },
    { x: 1060, y: 280, dy: -16, label: "measure" },
  ];

  return (
    <div
      aria-hidden
      className={`${styles.root} ${variant === "quiet" ? styles.quiet : ""}`}
    >
      <div className={styles.glow} />
      <svg
        className={styles.svg}
        viewBox="0 0 1440 640"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        {/* Routes not taken — the field the primary route is selected from. */}
        <path
          className={styles.traceAmbient}
          d="M -40 640 H 300 L 360 580 H 640 L 700 520 H 1120 L 1180 460 H 1480"
        />
        <path
          className={styles.traceAmbient}
          d="M 200 -20 V 60 H 520 L 580 120 H 900 L 960 60 H 1480"
        />
        <path className={styles.traceAmbient} d="M 880 640 V 470 H 1210 L 1260 420 H 1480" />
        <path className={styles.trace} d="M -40 180 H 260 L 320 240 H 520" />
        <path className={styles.trace} d="M 1140 -20 V 90 H 1330 L 1380 140 H 1480" />

        {/* Checkpoints on the ambient routes: a measurement is possible anywhere,
            it is just not what this particular request is doing. */}
        {[
          [360, 580],
          [700, 520],
          [580, 120],
          [1210, 470],
        ].map(([x, y]) => (
          <rect key={`${x}-${y}`} className={styles.checkpoint} x={x! - 3} y={y! - 3} width={6} height={6} />
        ))}

        {/* The primary route. */}
        <path className={styles.tracePrimary} d={PRIMARY} />
        <path className={styles.pulse} d={PRIMARY} />

        {/* The refused branch — it leaves the validator and terminates in a cross
            rather than continuing to execution. */}
        <path className={styles.traceRefused} d="M 440 400 L 500 344 H 606" />
        <g className={styles.reject}>
          <path d="M 620 330 l 14 14 M 634 330 l -14 14" />
        </g>

        {/* Nodes + stage labels. */}
        {NODES.map((n) => (
          <g key={n.label}>
            <circle className={styles.node} cx={n.x} cy={n.y} r={5.5} />
            <circle className={styles.nodeCore} cx={n.x} cy={n.y} r={2} />
            <text className={styles.label} x={n.x - 4} y={n.y + n.dy}>
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
