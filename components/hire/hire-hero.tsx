import { Caveat } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Float } from "@/components/motion/float";
import { PulseRings } from "@/components/motion/pulse-rings";
import { SITE } from "@/config/site";
import { hirePage } from "@/content/pages/hire";
import styles from "./hire.module.css";

/**
 * The handwritten accent, self-hosted by next/font and fetched by this page
 * only. Not preloaded: Next preloads a font on every route whose stylesheets
 * hold its @font-face, and CSS chunking by route (next.config.ts) can merge
 * this face into a small chunk the home page shares with /hire. A preload then
 * put a 50 KB font, which home never draws, among its first requests. Without
 * it the face is fetched only where text set in it is laid out: here.
 */
const caveat = Caveat({ subsets: ["latin"], weight: "500", display: "swap", preload: false });

const MARK_SIZE = 196;
const MARK_RADIUS = 52;

/** The construction lines behind the mark (an original drawing, faded radially). */
function Guides() {
  return (
    <svg
      className={styles.guides}
      viewBox="0 0 920 520"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="hire-guides-fade" cx="50%" cy="50%" r="50%">
          <stop offset=".3" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="hire-guides-mask">
          <rect width="920" height="520" fill="url(#hire-guides-fade)" />
        </mask>
      </defs>
      <g mask="url(#hire-guides-mask)" className={styles.guideLines}>
        <line x1="0" y1="260" x2="920" y2="260" />
        <line x1="460" y1="0" x2="460" y2="520" />
        <line x1="200" y1="0" x2="720" y2="520" />
        <line x1="720" y1="0" x2="200" y2="520" />
        <line x1="275" y1="0" x2="275" y2="520" />
        <line x1="645" y1="0" x2="645" y2="520" />
        <line x1="0" y1="75" x2="920" y2="75" />
        <line x1="0" y1="445" x2="920" y2="445" />
        <rect x="275" y="75" width="370" height="370" rx="64" />
        <circle cx="460" cy="260" r="156" />
        <circle cx="460" cy="260" r="122" />
      </g>
    </svg>
  );
}

/**
 * The /hire hero (Clerk Careers): the glass monogram floating on a stage of
 * construction lines, three pulse rings staggered over 12s and a cyan to
 * violet glow; then the h1 with its handwritten accent and the jump to roles.
 * A11y: the stage is decorative; the accent is part of the h1's text.
 * Reduced motion: the float stops and the rings are hidden (components/motion).
 */
export function HireHero() {
  const { title, accent, cta } = hirePage.hero;
  return (
    <section className={styles.hero} aria-labelledby="hire-title">
      <div className={styles.stage} aria-hidden="true">
        <div className={styles.glow} />
        <Guides />
        <PulseRings size={MARK_SIZE} radius={MARK_RADIUS} />
        <Float className={styles.glass}>
          <span>{SITE.monogram}</span>
        </Float>
      </div>
      <div className="relative mx-auto max-w-[var(--width-container)] px-[var(--gutter)]">
        <h1 id="hire-title" className={styles.title}>
          {title} <span className={`${styles.script} ${caveat.className}`}>{accent}</span>
        </h1>
        <Button variant="violet" size="lg" caret href={cta.href} className="mt-8">
          {cta.label}
        </Button>
      </div>
    </section>
  );
}
