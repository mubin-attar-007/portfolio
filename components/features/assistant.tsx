"use client";

import { Suspense, lazy, useEffect, useRef, useState } from "react";

const AssistantPanel = lazy(() =>
  import("./assistant-panel").then((m) => ({ default: m.AssistantPanel })),
);

/**
 * Assistant — the "Ask about my work" launcher. Renders a quiet trigger and,
 * only once opened, lazy-loads the panel (keeps it off the initial bundle per
 * the ≤60KB assistant budget). Pressing "/" anywhere opens it, unless the user
 * is typing in a field. A11y: the trigger keeps focus to restore on close.
 */
export function Assistant() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      const typing =
        el instanceof HTMLElement &&
        (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (typing) return;
      e.preventDefault();
      setOpen(true);
    };
    // Mobile nav (and any other trigger) opens the assistant via this event,
    // since the header trigger + "/" hotkey are desktop/keyboard only.
    const onOpen = () => setOpen(true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("open-assistant", onOpen);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("open-assistant", onOpen);
    };
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-[var(--radius-md)] border border-border-strong px-3 py-1.5 text-sm text-ink transition-colors hover:border-accent hover:text-accent md:inline-flex"
      >
        Ask Friday
        <kbd className="rounded-[var(--radius-sm)] border border-border bg-bg-subtle px-1 font-mono text-xs text-ink-tertiary">
          /
        </kbd>
      </button>
      {open ? (
        <Suspense fallback={null}>
          <AssistantPanel onClose={() => setOpen(false)} returnFocusRef={triggerRef} />
        </Suspense>
      ) : null}
    </>
  );
}
