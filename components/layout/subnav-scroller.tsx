"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { centreInScroller, useEdgeFade } from "@/lib/use-edge-fade";

/**
 * SubnavScroller — the horizontal scroller of `WorkSubnav`: on mount it
 * scrolls the current item (`[aria-current="page"]`) into the middle without
 * moving the page, and fades an edge that hides items (`useEdgeFade`).
 */
export function SubnavScroller({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEdgeFade(ref);

  useEffect(() => {
    const el = ref.current;
    centreInScroller(el, el?.querySelector<HTMLElement>('[aria-current="page"]') ?? null);
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
