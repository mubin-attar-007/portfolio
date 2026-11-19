"use client";

import { useRef, type ComponentProps } from "react";
import { cx } from "@/components/ui/cx";
import { useEdgeFade } from "@/lib/use-edge-fade";

/**
 * FadeScroller — a `div` that scrolls sideways and fades an end that hides
 * content (`.edge-fade`, `useEdgeFade`). Every other prop (a role, an ARIA
 * name) passes through, so a chip row can be a tablist.
 */
export function FadeScroller({ className, ...props }: ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  useEdgeFade(ref);
  return <div ref={ref} className={cx("edge-fade", className)} {...props} />;
}
