"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Spotlight — writes the pointer position into `--mx`/`--my` on `.spotlight`
 * descendants so the CSS in styles/globals.css can paint a highlight that
 * follows the cursor inside each card (the Clerk card treatment).
 *
 * Props:
 * - `children` — the group of cards. Any descendant carrying `.spotlight`
 *   participates; nothing else is touched.
 *
 * Why a wrapper rather than per-card state: one `pointermove` listener for the
 * whole group, coordinates written straight to CSS custom properties inside a
 * rAF. Nothing re-renders — React never sees the pointer, so a grid of cards
 * costs one listener and zero reconciliation.
 *
 * Accessibility: purely decorative. The effect only ever adds a faint wash
 * behind existing content, carries no information, and is exposed to no
 * assistive technology. Under `prefers-reduced-motion` the listener is never
 * attached and the CSS never raises opacity, so the cards stay flat. Without
 * JS or a pointer (touch, keyboard) the same is true — the card renders as its
 * plain bordered self, which is the designed baseline.
 *
 * Performance: passive listener, rAF-coalesced, and it writes to a custom
 * property that only drives a compositor-friendly gradient — no layout, no
 * paint of the content itself.
 */
export function Spotlight({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host || reduced) return;
    // Coarse pointers get no benefit (there is no hover) and would pay the
    // listener cost on every touch-drag.
    if (!window.matchMedia("(hover: hover)").matches) return;

    let frame = 0;
    let pending: { card: HTMLElement; x: number; y: number } | null = null;

    const flush = () => {
      frame = 0;
      if (!pending) return;
      const { card, x, y } = pending;
      pending = null;
      card.style.setProperty("--mx", `${x}%`);
      card.style.setProperty("--my", `${y}%`);
    };

    const onMove = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const card = target.closest<HTMLElement>(".spotlight");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      pending = {
        card,
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
      };
      frame ||= requestAnimationFrame(flush);
    };

    host.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      host.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return <div ref={hostRef}>{children}</div>;
}
