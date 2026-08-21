"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import styles from "./proof-band.module.css";

/** How long each tool holds its cell before the column advances. */
const DWELL_MS = 2600;

/**
 * TechWall — the honest replacement for a "trusted by" logo wall.
 *
 * A personal site has no customer logos, and inventing some would break the one
 * rule the whole portfolio rests on. What it does have is a real stack shipping
 * four live products, so the wall shows that instead: five hairline cells, each
 * cycling its own short column of tools.
 *
 * Every column advances on ONE timer rather than five. Five independent
 * intervals drift apart within a minute and start looking like a fault; one tick
 * with a per-column CSS `transition-delay` keeps the wave deliberate and costs a
 * single timer for the whole band.
 *
 * Motion policy: this is a discrete, dwelling cycle, not a marquee — nothing
 * scrolls and nothing loops continuously across the viewport. It is also not
 * essential: with `prefers-reduced-motion: reduce` the timer never starts and
 * the wall renders as a static row of five tools. That is a designed still pose,
 * not an animation that was switched off mid-flight. The timer also stops while
 * the tab is hidden, so a backgrounded page is not paying for it.
 *
 * A11y: the wall is decorative reinforcement of the lead sentence beside it, and
 * the tools it cycles are all listed in full on /uses. The whole strip is
 * therefore `aria-hidden` — announcing five cells whose contents change every
 * 2.6 seconds would be a live region nobody asked for. The lead sentence stays
 * in the accessibility tree.
 *
 * CONTENT ARRIVES AS PROPS, and that is load-bearing rather than stylistic.
 * Importing `@/content/home-visual` here pulled the whole content graph across
 * the client boundary — home-visual imports the eval registry, which imports the
 * Zod schemas and `.parse()`s at module load — so a five-word marquee was
 * shipping a validation library and every project record to the browser. A
 * client component reads props, not the content layer.
 */
export function TechWall({
  lead,
  columns,
}: {
  lead: string;
  columns: readonly (readonly string[])[];
}) {
  const reduced = useReducedMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduced) return;
    let id: ReturnType<typeof setInterval> | undefined;

    const start = () => {
      if (id === undefined) id = setInterval(() => setTick((t) => t + 1), DWELL_MS);
    };
    const stop = () => {
      if (id !== undefined) {
        clearInterval(id);
        id = undefined;
      }
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return (
    <div className={`${styles.row} ${styles.wall}`}>
      <p className={styles.wallLead}>{lead}</p>

      {columns.map((column, columnIndex) => {
        const active = tick % column.length;
        return (
          <div key={column[0]} className={styles.wallCell} aria-hidden>
            <span className={styles.slot}>
              {column.map((tool, i) => (
                <span
                  key={tool}
                  className={[
                    styles.slotItem,
                    i === active ? styles.slotItemActive : "",
                    i < active ? styles.slotItemPast : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  // Each column lags its neighbour, so the row reads as one wave
                  // rather than five cells snapping in unison.
                  style={{ transitionDelay: `${columnIndex * 70}ms` }}
                >
                  {tool}
                </span>
              ))}
            </span>
          </div>
        );
      })}
    </div>
  );
}
