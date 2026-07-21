"use client";

import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { ASSISTANT_LAUNCHER_ATTR } from "./mobile-assistant-launcher";

const AssistantPanel = lazy(() =>
  import("./assistant-panel").then((m) => ({ default: m.AssistantPanel })),
);

/**
 * Assistant — the "Ask about my work" launcher. Renders a quiet trigger and,
 * only once opened, lazy-loads the panel (keeps it off the initial bundle per
 * the ≤60KB assistant budget). Pressing "/" anywhere opens it, unless the user
 * is typing in a field. A11y: owns the close path so focus always returns to a
 * launcher the visitor can see (WCAG 2.4.3).
 */
export function Assistant() {
  const [open, setOpen] = useState(false);

  // This trigger is display:none below md, and focusing a display:none element
  // silently strands focus on <body>. So restore to the first launcher that is
  // actually rendered — getClientRects() rather than offsetParent, because the
  // mobile launcher is position:fixed and always reports a null offsetParent.
  const close = useCallback(() => {
    setOpen(false);
    const launchers = document.querySelectorAll<HTMLElement>(`[${ASSISTANT_LAUNCHER_ATTR}]`);
    for (const el of launchers) {
      if (el.getClientRects().length > 0) {
        el.focus();
        return;
      }
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Cmd/Ctrl+K — the expected command-palette shortcut; opens from anywhere,
      // even while typing (that's the convention users reach for).
      if ((e.metaKey || e.ctrlKey) && !e.altKey && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      // "/" also opens, but only when the user isn't typing in a field.
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
        {...{ [ASSISTANT_LAUNCHER_ATTR]: "" }}
        type="button"
        onClick={() => setOpen(true)}
        title="Friday — an AI assistant that answers only from this site's content (case studies, writing, résumé). Press ⌘K or / to open."
        aria-label="Ask Friday — an AI assistant grounded on this site. Press command-K or slash to open."
        className="hidden items-center gap-2 rounded-[var(--radius-md)] border border-border-strong px-3 py-1.5 text-sm text-ink transition-colors hover:border-accent hover:text-accent md:inline-flex"
      >
        Ask Friday
        <kbd className="rounded-[var(--radius-sm)] border border-border bg-bg-subtle px-1.5 font-mono text-[0.7rem] text-ink-tertiary">
          ⌘K
        </kbd>
      </button>
      {open ? (
        <Suspense fallback={null}>
          <AssistantPanel onClose={close} />
        </Suspense>
      ) : null}
    </>
  );
}
