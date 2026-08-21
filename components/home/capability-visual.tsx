import styles from "./capability-visual.module.css";

export type CapabilityVisualKind = "retrieval" | "gate" | "matrix" | "pipeline";

/**
 * CapabilityVisual — one small original diagram per capability card.
 *
 * Each draws the actual mechanism:
 *
 * - `retrieval` a query fanning over candidates, with the two highest-ranked
 *               selected and the rest left unlit — "retrieve the smallest useful
 *               context", drawn.
 * - `gate`      three requests reaching a deterministic gate; two continue, one
 *               is refused before it reaches the far side.
 * - `matrix`    an evaluation grid where most cells pass and some do not, with
 *               the failures dashed rather than merely a different colour.
 * - `pipeline`  four delivery stages with the trace filled through them.
 *
 * A generic Lucide icon was the alternative and was rejected: "a shield" and
 * "a gate that one of three requests does not get through" are not the same
 * statement, and the second one is the capability.
 *
 * All four are decorative — the card's heading and body carry the meaning — so
 * every SVG is `aria-hidden` and none is focusable. They are static: nothing
 * animates, so there is no reduced-motion behaviour to define.
 *
 * Geometry is a shared 200×88 viewBox at `preserveAspectRatio` default, so the
 * four sit on one baseline grid regardless of card width.
 */
export function CapabilityVisual({ kind }: { kind: CapabilityVisualKind }) {
  return (
    <svg
      className={styles.svg}
      viewBox="0 0 200 88"
      role="presentation"
      aria-hidden
      focusable="false"
    >
      {kind === "retrieval" ? <Retrieval /> : null}
      {kind === "gate" ? <Gate /> : null}
      {kind === "matrix" ? <Matrix /> : null}
      {kind === "pipeline" ? <Pipeline /> : null}
    </svg>
  );
}

/** A question fans over six candidates; the two best-ranked are selected. */
function Retrieval() {
  const candidates = [
    { y: 12, on: false },
    { y: 26, on: true },
    { y: 40, on: false },
    { y: 54, on: true },
    { y: 68, on: false },
    { y: 80, on: false },
  ];
  return (
    <>
      <circle className={styles.dotActive} cx={16} cy={44} r={3.5} />
      {candidates.map((c) => (
        <path
          key={c.y}
          className={c.on ? styles.lineActive : styles.line}
          d={`M 22 44 C 52 44, 58 ${c.y}, 84 ${c.y}`}
        />
      ))}
      {candidates.map((c) => (
        <circle
          key={`n-${c.y}`}
          className={c.on ? styles.dotActive : styles.dot}
          cx={88}
          cy={c.y}
          r={2.75}
        />
      ))}
      {/* The two selected candidates converge into the prompt that is built. */}
      <path className={styles.lineActive} d="M 92 26 C 116 26, 122 44, 140 44" />
      <path className={styles.lineActive} d="M 92 54 C 116 54, 122 44, 140 44" />
      <rect className={styles.plateActive} x={140} y={33} width={46} height={22} rx={3} />
      <text className={styles.caption} x={148} y={47}>
        context
      </text>
    </>
  );
}

/** Three requests reach a deterministic gate; one is refused before execution. */
function Gate() {
  return (
    <>
      {[22, 44, 66].map((y) => (
        <circle key={y} className={styles.dot} cx={14} cy={y} r={2.75} />
      ))}
      <path className={styles.line} d="M 19 22 H 92" />
      <path className={styles.line} d="M 19 44 H 92" />
      <path className={styles.line} d="M 19 66 H 92" />

      {/* The gate itself — one solid bar the paths must cross. */}
      <rect className={styles.gateBar} x={94} y={10} width={4} height={68} rx={2} />
      <text className={styles.caption} x={82} y={86}>
        validate
      </text>

      {/* Two continue. */}
      <path className={styles.lineActive} d="M 100 22 H 172" />
      <path className={styles.lineActive} d="M 100 66 H 172" />
      <circle className={styles.dotActive} cx={176} cy={22} r={2.75} />
      <circle className={styles.dotActive} cx={176} cy={66} r={2.75} />

      {/* One does not — dashed, and stopped by a cross well short of the edge. */}
      <path className={styles.lineRejected} d="M 100 44 H 150" />
      <path className={styles.mark} d="M 156 40 l 7 8 M 163 40 l -7 8" />
    </>
  );
}

/** An evaluation grid: most cases pass, some do not, and the misses are dashed. */
function Matrix() {
  const FAIL = new Set(["1-2", "3-0", "5-3", "6-1"]);
  const cols = 8;
  const rows = 4;
  return (
    <>
      {Array.from({ length: cols }).map((_, c) =>
        Array.from({ length: rows }).map((__, r) => {
          const key = `${c}-${r}`;
          const x = 12 + c * 20;
          const y = 10 + r * 17;
          return FAIL.has(key) ? (
            <rect key={key} className={styles.cellFail} x={x} y={y} width={13} height={11} rx={2} />
          ) : (
            <rect key={key} className={styles.cellPass} x={x} y={y} width={13} height={11} rx={2} />
          );
        }),
      )}
      {/* The axis rule — this is a scored set, not a decorative grid. */}
      <path className={styles.line} d="M 8 84 H 188" />
      <text className={styles.caption} x={8} y={80}>
        cases
      </text>
    </>
  );
}

/** Four delivery stages with the trace filled through all of them. */
function Pipeline() {
  const stages = ["build", "test", "ship", "watch"];
  return (
    <>
      <path className={styles.line} d="M 22 44 H 178" />
      <path className={styles.lineActive} d="M 22 44 H 178" />
      {stages.map((label, i) => {
        const x = 22 + i * 52;
        return (
          <g key={label}>
            <circle className={styles.ring} cx={x} cy={44} r={6} />
            <circle className={styles.dotActive} cx={x} cy={44} r={2.25} />
            <text className={styles.caption} x={x - 12} y={66}>
              {label}
            </text>
          </g>
        );
      })}
      {/* The loop back from observation to the next build — delivery is a cycle,
          and a straight line would be describing a launch, not an iteration. */}
      <path className={styles.lineRejected} d="M 178 44 C 178 18, 22 18, 22 38" />
    </>
  );
}
