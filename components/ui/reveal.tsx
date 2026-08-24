"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Reveal — the section entrance, on the third and correct design.
 *
 * THE RULE: only elements that were BELOW THE FOLD at mount are ever hidden.
 * Anything already on screen is left alone. That inversion is what makes the
 * effect safe — a reveal that never fires costs an animation, never content.
 *
 * Two earlier attempts got this wrong in the same way, and both shipped a blank
 * page body into full-page captures:
 *
 *   1. An IntersectionObserver that hid everything up front and revealed on
 *      intersection. Any context where the observer had not run yet was a
 *      context with no page.
 *   2. A CSS `animation-timeline: view()` version — declaratively hidden, same
 *      failure, now without even a JS escape hatch.
 *
 * Both shared one structure: content hidden until an engine drives it visible.
 * Here nothing is hidden unless JS has already demonstrated it can unhide it,
 * and three independent guards back that up — reduced motion never arms, a
 * missing IntersectionObserver never arms, and a 1.6s timer unhides everything
 * unconditionally even if the observer silently fails.
 *
 * Server children: the wrapper is a client component but its `children` are
 * server-rendered and passed through, so wrapping a section in `<Reveal>` does
 * NOT pull that section across the client boundary. The markup is in the
 * initial HTML either way.
 *
 * A11y: purely presentational. It adds no semantics, contributes nothing to the
 * accessibility tree, and under `prefers-reduced-motion: reduce` does nothing
 * at all — the page is simply present.
 */

/** Below this fraction of the viewport, an element counts as already seen. */
const FOLD_RATIO = 0.9;

/** Unconditional unhide, however the observer behaves. */
const SAFETY_MS = 1600;

export function Reveal({
  as: Tag = "div",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Guard 1 — reduced motion never arms, so nothing is ever hidden.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Guard 2 — no observer, no arming.
    if (!("IntersectionObserver" in window)) return;
    // Guard 3 — already visible? Leave it alone. This is the important one.
    if (el.getBoundingClientRect().top < window.innerHeight * FOLD_RATIO) return;

    el.setAttribute("data-reveal", "");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-inview", "");
          observer.unobserve(entry.target);
        }
      },
      // Start the entrance a little before the element's top edge lands, so it
      // is finishing as the reader arrives rather than starting under them.
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);

    // Guard 4 — the safety valve. A missed animation is free; missing content
    // is not, so this fires regardless of what the observer did.
    const safety = setTimeout(() => el.setAttribute("data-inview", ""), SAFETY_MS);

    return () => {
      clearTimeout(safety);
      observer.disconnect();
    };
  }, []);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
