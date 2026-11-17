"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { cx } from "@/components/ui/cx";
import { REVEAL_EVENT } from "@/components/work/reveal";
import styles from "./gallery.module.css";

/** One item of a gallery: its list title, its caption, and its content (rendered on the server). */
export type GalleryShot = { id: string; title: string; proves: string; media: ReactNode; portrait: boolean };

export type GalleryTabData = { id: string; label: string; shots: readonly GalleryShot[] };

/** The next index for a roving-tabindex key press, or null for any other key. */
function step(key: string, index: number, count: number, axis: "x" | "xy"): number | null {
  const back = key === "ArrowLeft" || (axis === "xy" && key === "ArrowUp");
  const forward = key === "ArrowRight" || (axis === "xy" && key === "ArrowDown");
  if (back) return index === 0 ? count - 1 : index - 1;
  if (forward) return index === count - 1 ? 0 : index + 1;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return null;
}

/**
 * MediaGallery — the Clerk showcase pattern, for captures, recordings and
 * code: a segmented control picks the surface (Desktop | Web), a list picks
 * the item, and a viewer shows it.
 *
 * Props: `label` names the segmented control; `listLabel` names each list;
 * `stage` (default true) fits each item into a fixed-size stage, so choosing
 * one never moves the page (captures); `false` lets the viewer take the item's
 * own height (code, recordings); `captions` (default true) prints the item's
 * title and caption under it.
 *
 * Only what has a choice is a control: one surface renders no segmented
 * control, and a surface with one item renders no list. Each control is a set
 * of ARIA tabs with one tab stop and a roving tabindex: ←/→ (Home/End) move
 * between surfaces; ↑/↓ or ←/→ between items.
 *
 * Motion: the segmented control's pill springs to the chosen surface; after
 * the first choice, an arriving item rises out of a short blur (the shared
 * `rise`). Reduced motion makes both instant. Hidden items are `hidden`, so
 * their lazy images load only when chosen.
 *
 * Reveal: a `REVEAL_EVENT` (components/work/reveal.ts) sent from inside a hidden
 * item selects its surface and item at once, so "Watch the demo" can scroll to
 * a recording on a surface the visitor had switched away from.
 */
export function MediaGallery({
  label,
  listLabel,
  tabs,
  stage = true,
  captions = true,
}: {
  label: string;
  listLabel: string;
  tabs: readonly GalleryTabData[];
  stage?: boolean;
  captions?: boolean;
}) {
  const base = useId();
  const [tab, setTab] = useState(0);
  const [chosen, setChosen] = useState<readonly number[]>(() => tabs.map(() => 0));
  const [animate, setAnimate] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const shotRefs = useRef<(HTMLButtonElement | null)[][]>(tabs.map(() => []));
  const hasTabs = tabs.length > 1;

  // Show the surface and item that hold a revealed element, before the sender
  // scrolls to it (flushSync: the DOM must be visible when the event returns).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onReveal = (event: Event) => {
      if (!(event.target instanceof Element)) return;
      const surface = event.target.closest<HTMLElement>("[data-surface]");
      if (!surface || !root.contains(surface)) return;
      const t = Number(surface.dataset.surface);
      const s = Number(event.target.closest<HTMLElement>("[data-item]")?.dataset.item ?? 0);
      flushSync(() => {
        setTab(t);
        setChosen((current) => current.map((value, i) => (i === t ? s : value)));
      });
    };
    root.addEventListener(REVEAL_EVENT, onReveal);
    return () => root.removeEventListener(REVEAL_EVENT, onReveal);
  }, []);

  const tabId = (i: number) => `${base}-tab-${tabs[i]!.id}`;
  const panelId = (i: number) => `${base}-panel-${tabs[i]!.id}`;
  const shotId = (t: number, s: number) => `${base}-item-${tabs[t]!.id}-${tabs[t]!.shots[s]!.id}`;
  const viewId = (t: number, s: number) => `${shotId(t, s)}-view`;

  const selectTab = (index: number, focus: boolean) => {
    setAnimate(true);
    setTab(index);
    if (focus) tabRefs.current[index]?.focus();
  };

  const selectShot = (t: number, index: number, focus: boolean) => {
    setAnimate(true);
    setChosen((current) => current.map((value, i) => (i === t ? index : value)));
    if (focus) shotRefs.current[t]?.[index]?.focus();
  };

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = step(event.key, index, tabs.length, "x");
    if (next === null) return;
    event.preventDefault();
    selectTab(next, true);
  };

  const onShotKey = (event: KeyboardEvent<HTMLButtonElement>, t: number, index: number) => {
    const next = step(event.key, index, tabs[t]!.shots.length, "xy");
    if (next === null) return;
    event.preventDefault();
    selectShot(t, next, true);
  };

  const segmentStyle = { "--count": tabs.length, "--index": tab } as CSSProperties;

  /** One item in the viewer, framed on the stage or at its own height, with its caption. */
  const view = (shot: GalleryShot) => (
    <>
      {stage ? (
        <div className={styles.stage} data-portrait={shot.portrait ? "" : undefined}>
          <div className={styles.media}>{shot.media}</div>
        </div>
      ) : (
        <div className={styles.plain}>{shot.media}</div>
      )}
      {captions ? (
        <p className={styles.caption}>
          <strong>{shot.title}.</strong> {shot.proves}
        </p>
      ) : null}
    </>
  );

  return (
    <div ref={rootRef} className={cx(styles.gallery, animate && styles.animate)}>
      {hasTabs ? (
        <div className={styles.segment} role="tablist" aria-label={label} style={segmentStyle}>
          <span className={styles.segmentPill} aria-hidden="true" />
          {tabs.map((item, i) => (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={tabId(i)}
              aria-selected={i === tab}
              aria-controls={panelId(i)}
              tabIndex={i === tab ? 0 : -1}
              className={styles.segmentTab}
              onClick={() => selectTab(i, false)}
              onKeyDown={(event) => onTabKey(event, i)}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      {tabs.map((item, t) => {
        const selected = chosen[t] ?? 0;
        const hasList = item.shots.length > 1;
        return (
          <div
            key={item.id}
            role={hasTabs ? "tabpanel" : undefined}
            id={hasTabs ? panelId(t) : undefined}
            aria-labelledby={hasTabs ? tabId(t) : undefined}
            hidden={t !== tab}
            className={styles.layout}
            data-surface={t}
            data-single={hasList ? undefined : ""}
            data-tabs={hasTabs ? "" : undefined}
          >
            {hasList ? (
              <div className={styles.list} role="tablist" aria-label={`${listLabel}: ${item.label}`} aria-orientation="vertical">
                {item.shots.map((shot, s) => (
                  <button
                    key={shot.id}
                    ref={(el) => {
                      shotRefs.current[t]![s] = el;
                    }}
                    type="button"
                    role="tab"
                    id={shotId(t, s)}
                    aria-selected={s === selected}
                    aria-controls={viewId(t, s)}
                    tabIndex={s === selected ? 0 : -1}
                    className={styles.item}
                    onClick={() => selectShot(t, s, false)}
                    onKeyDown={(event) => onShotKey(event, t, s)}
                  >
                    <span className={styles.itemNumber} aria-hidden="true">
                      {String(s + 1).padStart(2, "0")}
                    </span>
                    {shot.title}
                  </button>
                ))}
              </div>
            ) : null}

            <div className={styles.viewer}>
              {item.shots.map((shot, s) =>
                hasList ? (
                  <div
                    key={shot.id}
                    role="tabpanel"
                    id={viewId(t, s)}
                    aria-labelledby={shotId(t, s)}
                    tabIndex={0}
                    hidden={s !== selected}
                    className={styles.view}
                    data-item={s}
                  >
                    {view(shot)}
                  </div>
                ) : (
                  <div key={shot.id} className={styles.view}>
                    {view(shot)}
                  </div>
                ),
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
