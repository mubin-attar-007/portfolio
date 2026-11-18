"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** How long the copied or failed state shows before the control resets. */
const RESET_MS = 2200;

export type CopyState = "idle" | "copied" | "failed";

/**
 * Copy one string to the clipboard and report the outcome for a short while,
 * then return to `idle`. Shared by the hero's prompt chip and the agent
 * section's "Copy the prompt" action.
 */
export function useCopyPrompt(text: string): { state: CopyState; copy: () => Promise<void> } {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(async () => {
    let ok = true;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      ok = false;
    }
    setState(ok ? "copied" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), RESET_MS);
  }, [text]);

  return { state, copy };
}
