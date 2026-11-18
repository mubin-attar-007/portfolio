import { cx } from "./cx";
import styles from "./circuit-art.module.css";

/** One half of the drawing (720 of 1440 units); the other half is its mirror. */
function Half() {
  return (
    <>
      <path d="M30 120H250V250H430" />
      <path d="M140 30V190H300V410H500" />
      <path d="M0 330H170V520H360" />
      <path d="M210 640H420V480H540" />
      <path d="M60 470H120V700" />
      <path d="M330 60H520V170" />
      <rect x="190" y="228" width="64" height="44" rx="5" />
      <rect x="330" y="380" width="48" height="48" rx="5" />
      <rect x="470" y="140" width="36" height="28" rx="4" />
      <path d="M200 228v-8M214 228v-8M228 228v-8M242 228v-8M200 272v8M214 272v8M228 272v8M242 272v8" />
      <circle cx="430" cy="250" r="5" />
      <circle cx="500" cy="410" r="5" />
      <circle cx="360" cy="520" r="4" />
      <circle cx="540" cy="480" r="4" />
      <circle cx="30" cy="120" r="4" />
      <circle cx="520" cy="170" r="4" />
      <circle cx="354" cy="404" r="9" />
    </>
  );
}

/**
 * CircuitArt — faint circuit traces behind a hero (prototype `about.html`): an
 * original drawing of traces, chips and pads, mirrored about the centre and
 * masked so it fades before the content.
 *
 * It fills its nearest positioned ancestor (`position: absolute; inset: 0`), so
 * give the hero `position: relative; overflow: hidden` and put the content
 * after it (or above it with `position: relative`).
 *
 * Props: `fade` — `center` (an ellipse, the About mark), `top` (a page
 * header) or `sides` (a centred title with art at both edges). The traces are
 * the ink at 7%, so they turn white-on-dark inside a plate or a dark page.
 *
 * A11y: decorative — `aria-hidden`, no text. Performance: a static inline SVG,
 * no animation, scaled with `slice` so it covers any width.
 */
export function CircuitArt({
  fade = "center",
  className,
}: {
  fade?: "center" | "top" | "sides";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 1440 760"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
      focusable="false"
      className={cx(styles.art, styles[fade], className)}
    >
      <g fill="none" stroke="currentColor" strokeWidth={1.2}>
        <Half />
        <g transform="translate(1440 0) scale(-1 1)">
          <Half />
        </g>
      </g>
    </svg>
  );
}
