"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * SubnavScroller — the horizontal scroller of `WorkSubnav`: on mount it
 * scrolls the current item (`[aria-current="page"]`) into the middle without
 * moving the page, and marks which edges have hidden items (`data-fade-start`,
 * `data-fade-end`) so CSS can fade them.
 */
export function SubnavScroller({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const current = el.querySelector<HTMLElement>('[aria-current="page"]');
    if (current) el.scrollLeft = current.offsetLeft - (el.clientWidth - current.offsetWidth) / 2;
    const mark = () => {
      el.toggleAttribute("data-fade-start", el.scrollLeft > 1);
      el.toggleAttribute("data-fade-end", el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    mark();
    el.addEventListener("scroll", mark, { passive: true });
    const resize = new ResizeObserver(mark);
    resize.observe(el);
    return () => {
      el.removeEventListener("scroll", mark);
      resize.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
