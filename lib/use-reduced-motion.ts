import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

// The server can't know the preference, so it renders the motion-allowed markup;
// React swaps to the real snapshot immediately after hydration without a
// mismatch warning (that's what useSyncExternalStore's server snapshot is for).
function getServerSnapshot(): boolean {
  return false;
}

/**
 * useReducedMotion — subscribes to `prefers-reduced-motion: reduce`.
 *
 * Used by JS-driven motion (timers, sequenced state) that CSS media queries
 * can't switch off. Unlike a one-shot read in an effect it also reacts when the
 * visitor changes the OS setting mid-session.
 *
 * @returns true when the visitor asked for reduced motion.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
