"use client";

import { useEffect, type RefObject } from "react";

/**
 * useEdgeFade — marks which ends of a sideways scroller hide content, as
 * `data-fade-start` and `data-fade-end`, so the `.edge-fade` utility
 * (globals.css) fades only an edge that has more behind it. A row that fits
 * carries neither and shows no fade. Re-measured on scroll and on resize of
 * the scroller or its content.
 */
export function useEdgeFade(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mark = () => {
      el.toggleAttribute("data-fade-start", el.scrollLeft > 1);
      el.toggleAttribute("data-fade-end", el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    mark();
    el.addEventListener("scroll", mark, { passive: true });
    const resize = new ResizeObserver(mark);
    resize.observe(el);
    if (el.firstElementChild) resize.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", mark);
      resize.disconnect();
    };
  }, [ref]);
}

/** Scroll `item` to the middle of its sideways scroller without moving the page. */
export function centreInScroller(scroller: HTMLElement | null, item: HTMLElement | null, smooth = false) {
  if (!scroller || !item || scroller.scrollWidth <= scroller.clientWidth + 1) return;
  scroller.scrollTo({ left: item.offsetLeft - (scroller.clientWidth - item.offsetWidth) / 2, behavior: smooth ? "smooth" : "auto" });
}
