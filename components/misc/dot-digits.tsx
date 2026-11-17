import styles from "./misc.module.css";

/** Dot pitch and radius in SVG units (the drawing is 1000 wide). */
const PITCH = 7;
const DOT = 1.55;

/**
 * DotDigits — giant digits drawn as a halftone: the glyphs are filled with a
 * dot pattern and lit by a soft radial wash, inside a dotted frame (the dark
 * 404 and error pages). Decorative: the page states its message in text.
 */
export function DotDigits({ text, id }: { text: string; id: string }) {
  const dots = `${id}-dots`;
  const light = `${id}-light`;
  const mask = `${id}-mask`;
  return (
    <div className={styles.frame} aria-hidden="true">
      <svg className={styles.digits} viewBox="0 0 1000 440" focusable="false">
        <defs>
          <pattern id={dots} width={PITCH} height={PITCH} patternUnits="userSpaceOnUse">
            <circle cx={PITCH / 2} cy={PITCH / 2} r={DOT} style={{ fill: "var(--color-plate-ink)" }} />
          </pattern>
          <radialGradient id={light} cx="45%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#fff" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.12" />
          </radialGradient>
          <mask id={mask}>
            <rect width="1000" height="440" fill={`url(#${light})`} />
          </mask>
        </defs>
        <g mask={`url(#${mask})`}>
          <text x="500" y="350" textAnchor="middle" fontSize="380" fill={`url(#${dots})`}>
            {text}
          </text>
        </g>
      </svg>
    </div>
  );
}
