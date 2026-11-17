"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import styles from "./showcase.module.css";

export type ShowcaseItem = { id: string; label: string; panel: ReactNode };

/** Arriving panel: rises out of a short blur on the soft spring. */
const ENTER: Keyframe[] = [
  { opacity: 0, transform: "translateY(14px)", filter: "blur(6px)" },
  { opacity: 1, transform: "none", filter: "blur(0)" },
];
/** Leaving panel: lifts away and blurs out, faster than the arrival. */
const LEAVE: Keyframe[] = [
  { opacity: 1, transform: "none", filter: "blur(0)" },
  { opacity: 0, transform: "translateY(-10px)", filter: "blur(4px)" },
];
const ENTER_MS = 520;
const ENTER_DELAY_MS = 40;
const LEAVE_MS = 220;
/** The first sheen waits for the page to settle. */
const FIRST_SHEEN_MS = 300;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const cssVar = (el: Element, name: string) => getComputedStyle(el).getPropertyValue(name).trim();

/** Restart the sheen sweep across a panel's focus card. */
function sweep(panel: HTMLElement | null) {
  const card = panel?.querySelector<HTMLElement>("[data-focus]");
  if (!card || reducedMotion()) return;
  card.classList.remove(styles.sheen!);
  void card.offsetWidth; // restart the animation
  card.classList.add(styles.sheen!);
}

/**
 * ShowcaseTabs — ARIA tabs over a fixed-height stage (no layout shift). One
 * pill springs between the tabs; panels crossfade through a short blur and a
 * sheen crosses the arriving card. Roving tabindex: Tab enters the selected
 * tab, ←/→ (and Home/End) move and select. Reduced motion: instant.
 */
export function ShowcaseTabs({ label, items }: { label: string; items: readonly ShowcaseItem[] }) {
  const [selected, setSelected] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const indicator = useRef<HTMLSpanElement>(null);
  const tablist = useRef<HTMLDivElement>(null);
  const previous = useRef(selected);

  const place = useCallback((index: number, animate: boolean) => {
    const tab = tabRefs.current[index];
    const ind = indicator.current;
    if (!tab || !ind) return;
    ind.classList.toggle(styles.noAnim!, !animate);
    ind.style.width = `${tab.offsetWidth}px`;
    ind.style.height = `${tab.offsetHeight}px`;
    ind.style.transform = `translate(${tab.offsetLeft}px, ${tab.offsetTop}px)`;
  }, []);

  // Place the pill once laid out, and again on resize and when fonts land.
  useLayoutEffect(() => {
    place(selected, false);
    tablist.current?.classList.add(styles.hasInd!);
    const onResize = () => place(previous.current, false);
    window.addEventListener("resize", onResize);
    void document.fonts?.ready.then(onResize);
    const first = window.setTimeout(() => sweep(panelRefs.current[0] ?? null), FIRST_SHEEN_MS);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(first);
    };
    // Mount only: later moves are animated by the selection effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place]);

  // Animate a change of selection.
  useEffect(() => {
    const from = previous.current;
    if (from === selected) return;
    previous.current = selected;
    const still = reducedMotion();
    place(selected, !still);
    const inn = panelRefs.current[selected];
    const out = panelRefs.current[from];
    if (still || !inn?.animate) return;
    inn.getAnimations().forEach((a) => a.cancel());
    const spring = cssVar(inn, "--spring-soft") || "ease";
    inn.animate(ENTER, { duration: ENTER_MS, delay: ENTER_DELAY_MS, easing: spring, fill: "backwards" });
    sweep(inn);
    if (!out) return;
    out.getAnimations().forEach((a) => a.cancel());
    const leave = out.animate(LEAVE, { duration: LEAVE_MS, easing: cssVar(out, "--ease-out") || "ease-out", fill: "forwards" });
    leave.finished
      .then(() => {
        setLeaving((current) => (current === from ? null : current));
        leave.cancel();
      })
      .catch(() => {}); // cancelled: the panel was selected again
  }, [selected, place]);

  const select = (index: number, focus = false) => {
    if (focus) tabRefs.current[index]?.focus();
    if (index === selected) return;
    // Keep the old panel on stage while it animates out (never under reduced motion).
    setLeaving(reducedMotion() ? null : selected);
    setSelected(index);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = items.length - 1;
    const next =
      event.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : event.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : null;
    if (next === null) return;
    event.preventDefault();
    select(next, true);
  };

  return (
    <div className={styles.show}>
      <div ref={tablist} className={styles.tabs} role="tablist" aria-label={label}>
        <span ref={indicator} className={styles.indicator} aria-hidden="true" />
        {items.map((item, i) => (
          <button
            key={item.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`showcase-tab-${item.id}`}
            aria-selected={i === selected}
            aria-controls={`showcase-panel-${item.id}`}
            tabIndex={i === selected ? 0 : -1}
            className={styles.tab}
            onClick={() => select(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className={styles.stage}>
        {items.map((item, i) => (
          <div
            key={item.id}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            id={`showcase-panel-${item.id}`}
            role="tabpanel"
            aria-labelledby={`showcase-tab-${item.id}`}
            tabIndex={0}
            hidden={i !== selected && i !== leaving}
            inert={i !== selected}
            className={styles.panel}
          >
            {item.panel}
          </div>
        ))}
      </div>
    </div>
  );
}
