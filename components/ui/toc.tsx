"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { cx } from "./cx";
import styles from "./toc.module.css";

export type TocItem = {
  /** The id of the heading this entry jumps to. */
  id: string;
  label: string;
  /** Nested entries (one level is the norm: h2 → h3). */
  items?: readonly TocItem[];
};

/** The band at the top of the viewport (top 30%) where a heading becomes current. */
const CURRENT_BAND = "0px 0px -70% 0px";
const CURRENT_LINE = 0.3;
/** After a jump, how long the page must be still before scrolling may move the indicator again. */
const SETTLE_MS = 160;
/** How long a chosen entry holds when its jump does not scroll at all (the heading was in place). */
const HOLD_MS = 400;

function flatten(items: readonly TocItem[]): string[] {
  return items.flatMap((item) => [item.id, ...flatten(item.items ?? [])]);
}

/**
 * Toc — a sticky table of contents with nested entries and an active-section
 * indicator (the Clerk legal page and blog sidebar "Jump to").
 *
 * Props: `items` (id, label, nested items — the ids of headings on the page),
 * `title` (default "On this page"; names the navigation), `className`.
 *
 * Behaviour: an IntersectionObserver watches the headings; the current one is
 * the last heading above the line 30% down the viewport (the last one, once the
 * page is scrolled to its end). A violet bar springs to it. Clicking an entry
 * makes it current at once and holds it while the page scrolls by the normal
 * anchor jump (smooth, or instant under reduced motion; clearing the nav by
 * `scroll-padding-top`), so a short section never hands the bar to the next
 * heading; only the reader's own scrolling moves it after that. A deep link
 * (`#id` on load) makes its entry current the same way.
 *
 * Layout: sticky at `--sticky-top`, scrolling inside itself when taller than
 * the viewport. Hide it on small screens from the page if it does not fit.
 * A11y: a `<nav>` named by its visible title; nested ordered lists; the current
 * entry has `aria-current="true"`. Motion: transform only.
 */
export function Toc({
  items,
  title = "On this page",
  className,
}: {
  items: readonly TocItem[];
  title?: string;
  className?: string;
}) {
  const titleId = useId();
  const ids = useMemo(() => flatten(items), [items]);
  const [current, setCurrent] = useState<string | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  // An entry chosen by a click or a deep link, held until its jump settles.
  const chosenRef = useRef<string | null>(null);
  const settleRef = useRef<number | undefined>(undefined);

  const release = useCallback((after: number) => {
    window.clearTimeout(settleRef.current);
    settleRef.current = window.setTimeout(() => {
      chosenRef.current = null;
    }, after);
  }, []);

  const choose = useCallback(
    (id: string) => {
      chosenRef.current = id;
      setCurrent(id);
      release(HOLD_MS);
    },
    [release],
  );

  // Track the current heading.
  useEffect(() => {
    const headings = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0 || typeof IntersectionObserver === "undefined") return;

    const update = () => {
      if (chosenRef.current) return;
      const root = document.documentElement;
      const atEnd = window.innerHeight + window.scrollY >= root.scrollHeight - 4;
      if (atEnd) {
        setCurrent(headings[headings.length - 1]!.id);
        return;
      }
      const line = window.innerHeight * CURRENT_LINE;
      let next = headings[0]!.id;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top > line) break;
        next = heading.id;
      }
      setCurrent(next);
    };

    const observer = new IntersectionObserver(update, { rootMargin: CURRENT_BAND });
    for (const heading of headings) observer.observe(heading);
    // The observer misses the page's end when the last section is short.
    let frame = 0;
    const onScroll = () => {
      // A chosen entry's jump is still scrolling: hold it until the page is still.
      if (chosenRef.current) {
        release(SETTLE_MS);
        return;
      }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // A deep link lands on its section: that entry is current, not its neighbour.
    const fromHash = decodeURIComponent(window.location.hash.slice(1));
    const hashFrame = ids.includes(fromHash) ? requestAnimationFrame(() => choose(fromHash)) : 0;
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(hashFrame);
      window.clearTimeout(settleRef.current);
    };
  }, [ids, choose, release]);

  // Move the indicator to the current entry, and keep it there through resizes.
  useEffect(() => {
    const rail = railRef.current;
    const indicator = indicatorRef.current;
    if (!rail || !indicator) return;
    const place = () => {
      const link = current ? rail.querySelector<HTMLElement>(`[data-toc-id="${CSS.escape(current)}"]`) : null;
      if (!link) {
        indicator.removeAttribute("data-visible");
        return;
      }
      indicator.style.setProperty("--toc-y", `${link.offsetTop}px`);
      indicator.style.setProperty("--toc-h", String(link.offsetHeight));
      indicator.setAttribute("data-visible", "");
    };
    place();
    const resize = new ResizeObserver(place);
    resize.observe(rail);
    return () => resize.disconnect();
  }, [current]);

  return (
    <nav aria-labelledby={titleId} className={cx(styles.toc, className)}>
      <p id={titleId} className={styles.title}>
        {title}
      </p>
      <div ref={railRef} className={styles.rail}>
        <span ref={indicatorRef} className={styles.indicator} aria-hidden="true" />
        <TocList items={items} current={current} depth={0} onSelect={choose} />
      </div>
    </nav>
  );
}

function TocList({
  items,
  current,
  depth,
  onSelect,
}: {
  items: readonly TocItem[];
  current: string | null;
  depth: number;
  onSelect: (id: string) => void;
}) {
  return (
    <ol className={styles.list}>
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            data-toc-id={item.id}
            aria-current={current === item.id ? "true" : undefined}
            className={cx(styles.link, depth > 0 && styles.sub)}
            onClick={() => onSelect(item.id)}
          >
            {item.label}
          </a>
          {item.items?.length ? (
            <TocList items={item.items} current={current} depth={depth + 1} onSelect={onSelect} />
          ) : null}
        </li>
      ))}
    </ol>
  );
}
