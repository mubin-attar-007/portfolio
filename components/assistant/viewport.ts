import { useEffect, type RefObject } from "react";

/**
 * How much of the layout viewport's bottom the on-screen keyboard covers, in
 * CSS pixels: the part of the window below the visual viewport. iOS Safari and
 * Android Chrome shrink the visual viewport, not the layout one, when the
 * keyboard opens, so a sheet fixed to the bottom would sit under it.
 * Sub-pixel noise and a browser that reports nothing are 0.
 */
export function keyboardInset(innerHeight: number, viewportHeight: number, viewportTop: number): number {
  const covered = innerHeight - viewportHeight - viewportTop;
  return Number.isFinite(covered) && covered > 1 ? Math.round(covered) : 0;
}

/**
 * Keep a bottom sheet above the on-screen keyboard: while the element is
 * mounted, `--a-keyboard` is the keyboard's height and `--a-viewport` the
 * visible height, both in px, updated as the visual viewport changes. The
 * stylesheet lifts and fits the phone sheet with them; from `sm` the drawer
 * ignores them. Without `visualViewport` (old browsers) nothing is set and the
 * CSS falls back to the full height.
 */
export function useKeyboardInset(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const viewport = window.visualViewport;
    const element = ref.current;
    if (!viewport || !element) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        element.style.setProperty("--a-keyboard", `${keyboardInset(window.innerHeight, viewport.height, viewport.offsetTop)}px`);
        element.style.setProperty("--a-viewport", `${Math.round(viewport.height)}px`);
      });
    };
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, [ref]);
}
