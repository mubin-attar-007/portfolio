"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/components/ui/cx";

/**
 * ScrollRegion — the sideways scroller around content wider than its column (a
 * wide table on a phone or tablet). While the content overflows, the scroller
 * is a named region with a tab stop, so the keyboard can reach and scroll it
 * (design-system.md §8), and it carries `data-overflows` for styles that only
 * make sense while it scrolls (a pinned column's edge). While the content fits
 * it is neither, and costs no extra Tab.
 *
 * Only the measurement runs on the client: server-rendered children pass
 * straight through.
 *
 * Props: `label` — the region's name, distinct from the table's caption and
 * from the section's name ("Results table, scrolls sideways"); `className` —
 * the scroller's own surface (it already scrolls on the x axis and contains
 * its overscroll).
 */
export function ScrollRegion({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setOverflows(el.scrollWidth > el.clientWidth + 1);
    measure();
    // The scroller resizes with the viewport; its content can change width on
    // its own (a filtered table), so both are watched.
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cx("overflow-x-auto overscroll-x-contain", className)}
      {...(overflows ? { role: "region", "aria-label": label, tabIndex: 0, "data-overflows": "" } : {})}
    >
      {children}
    </div>
  );
}
