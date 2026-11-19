"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { centreInScroller, useEdgeFade } from "@/lib/use-edge-fade";
import styles from "./showcase.module.css";

/** One screen of a product: a pill under the stage names it. */
export type ShowcaseView = { id: string; label: string; panel: ReactNode };
/**
 * One product: a tab above the stage, its screens (one or more), and an
 * optional backdrop that stays put behind them while its screens change.
 */
export type ShowcaseItem = { id: string; label: string; views: readonly ShowcaseView[]; backdrop?: ReactNode };

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

/** Roving-tabindex keys: ←/→ (and Home/End) move and select, wrapping. */
function nextIndex(key: string, index: number, count: number): number | null {
  const last = count - 1;
  if (key === "ArrowRight") return index === last ? 0 : index + 1;
  if (key === "ArrowLeft") return index === 0 ? last : index - 1;
  if (key === "Home") return 0;
  if (key === "End") return last;
  return null;
}

/**
 * ShowcaseTabs — ARIA tabs over a fixed-height stage (no layout shift), two
 * levels deep as on the Clerk home page: a tab per product above the stage,
 * and under it a row of pills, one per screen of the selected product. One
 * pill springs between the product tabs; screens crossfade through a short
 * blur and a sheen crosses the arriving card, whichever level changed. Roving
 * tabindex in each row: Tab enters the selected tab, ←/→ (and Home/End) move
 * and select. Each product remembers the screen it was left on. Reduced
 * motion: instant.
 */
export function ShowcaseTabs({ label, items }: { label: string; items: readonly ShowcaseItem[] }) {
  const [selected, setSelected] = useState(0);
  const [views, setViews] = useState<Record<string, number>>({});
  const [leaving, setLeaving] = useState<string | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  /** Each product's panel, by product id; each screen's panel, by "product:screen". */
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const indicator = useRef<HTMLSpanElement>(null);
  const tablist = useRef<HTMLDivElement>(null);

  const item = items[selected]!;
  const viewIndex = Math.min(views[item.id] ?? 0, item.views.length - 1);
  const shownKey = `${item.id}:${item.views[viewIndex]!.id}`;
  const previous = useRef(selected);
  const previousKey = useRef(shownKey);

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
    const first = window.setTimeout(() => sweep(panelRefs.current[previousKey.current] ?? null), FIRST_SHEEN_MS);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(first);
    };
    // Mount only: later moves are animated by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place]);

  // On a phone the tabs scroll sideways: an edge that hides tabs fades.
  useEdgeFade(tablist);

  // The product tab's pill follows the selection, and a tab row that scrolls
  // brings the selected tab to its middle (never moving the page).
  useEffect(() => {
    if (previous.current === selected) return;
    previous.current = selected;
    place(selected, !reducedMotion());
    centreInScroller(tablist.current, tabRefs.current[selected] ?? null, !reducedMotion());
  }, [selected, place]);

  // Animate a change of screen: a new product moves its whole panel, a new
  // screen of the same product moves only the screen.
  useEffect(() => {
    const from = previousKey.current;
    if (from === shownKey) return;
    previousKey.current = shownKey;
    const fromItem = from.split(":")[0]!;
    const toItem = shownKey.split(":")[0]!;
    const sameItem = fromItem === toItem;
    const inn = sameItem ? panelRefs.current[shownKey] : itemRefs.current[toItem];
    const out = sameItem ? panelRefs.current[from] : itemRefs.current[fromItem];
    if (reducedMotion() || !inn?.animate) return;
    inn.getAnimations().forEach((a) => a.cancel());
    inn.animate(ENTER, { duration: ENTER_MS, delay: ENTER_DELAY_MS, easing: cssVar(inn, "--spring-soft") || "ease", fill: "backwards" });
    sweep(panelRefs.current[shownKey] ?? null);
    if (!out) return;
    out.getAnimations().forEach((a) => a.cancel());
    const leave = out.animate(LEAVE, { duration: LEAVE_MS, easing: cssVar(out, "--ease-out") || "ease-out", fill: "forwards" });
    leave.finished
      .then(() => {
        setLeaving((current) => (current === from ? null : current));
        leave.cancel();
      })
      .catch(() => {}); // cancelled: the screen was selected again
  }, [shownKey]);

  /** Show a screen: keep the old one on stage while it animates out (never under reduced motion). */
  const show = (nextSelected: number, nextView: number) => {
    const nextItem = items[nextSelected]!;
    const key = `${nextItem.id}:${nextItem.views[nextView]!.id}`;
    if (key === shownKey) return;
    setLeaving(reducedMotion() ? null : shownKey);
    setSelected(nextSelected);
    setViews((current) => ({ ...current, [nextItem.id]: nextView }));
  };

  const selectTab = (index: number, focus = false) => {
    if (focus) tabRefs.current[index]?.focus();
    if (index === selected) return;
    show(index, Math.min(views[items[index]!.id] ?? 0, items[index]!.views.length - 1));
  };
  const selectView = (index: number, focus = false) => {
    if (focus) pillRefs.current[index]?.focus();
    show(selected, index);
  };

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = nextIndex(event.key, index, items.length);
    if (next === null) return;
    event.preventDefault();
    selectTab(next, true);
  };
  const onPillKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = nextIndex(event.key, index, item.views.length);
    if (next === null) return;
    event.preventDefault();
    selectView(next, true);
  };

  return (
    <div className={styles.show}>
      <div ref={tablist} className={`edge-fade ${styles.tabs}`} role="tablist" aria-label={label}>
        <span ref={indicator} className={styles.indicator} aria-hidden="true" />
        {items.map((entry, i) => (
          <button
            key={entry.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`showcase-tab-${entry.id}`}
            aria-selected={i === selected}
            aria-controls={`showcase-panel-${entry.id}`}
            tabIndex={i === selected ? 0 : -1}
            className={styles.tab}
            onClick={() => selectTab(i)}
            onKeyDown={(e) => onTabKey(e, i)}
          >
            {entry.label}
          </button>
        ))}
      </div>
      <div className={styles.stage}>
        {items.map((entry, i) => {
          const entryView = Math.min(views[entry.id] ?? 0, entry.views.length - 1);
          const many = entry.views.length > 1;
          const entryOnStage = i === selected || leaving?.startsWith(`${entry.id}:`);
          return (
            <div
              key={entry.id}
              ref={(el) => {
                itemRefs.current[entry.id] = el;
              }}
              id={`showcase-panel-${entry.id}`}
              role="tabpanel"
              aria-labelledby={`showcase-tab-${entry.id}`}
              tabIndex={many ? undefined : 0}
              hidden={!entryOnStage}
              inert={i !== selected}
              className={styles.panel}
            >
              {entry.backdrop}
              {entry.views.map((view, v) => {
                const key = `${entry.id}:${view.id}`;
                const current = i === selected && v === entryView;
                return (
                  <div
                    key={view.id}
                    ref={(el) => {
                      panelRefs.current[key] = el;
                    }}
                    id={many ? `showcase-view-${entry.id}-${view.id}` : undefined}
                    role={many ? "tabpanel" : undefined}
                    aria-labelledby={many ? `showcase-pill-${entry.id}-${view.id}` : undefined}
                    tabIndex={many ? 0 : undefined}
                    hidden={!(current || key === leaving)}
                    inert={!current}
                    className={styles.panel}
                  >
                    {view.panel}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      {/* The selected product's screens, as Clerk's pills under its stage. */}
      <div className={styles.pillBar}>
        {item.views.length > 1 ? (
          <div key={item.id} className={styles.pills} role="tablist" aria-label={`${item.label}: screens`}>
            {item.views.map((view, v) => (
              <button
                key={view.id}
                ref={(el) => {
                  pillRefs.current[v] = el;
                }}
                type="button"
                role="tab"
                id={`showcase-pill-${item.id}-${view.id}`}
                aria-selected={v === viewIndex}
                aria-controls={`showcase-view-${item.id}-${view.id}`}
                tabIndex={v === viewIndex ? 0 : -1}
                className={styles.pill}
                onClick={() => selectView(v)}
                onKeyDown={(e) => onPillKey(e, v)}
              >
                {view.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
