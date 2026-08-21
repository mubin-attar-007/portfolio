"use client";

import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const AssistantPanel = lazy(() =>
  import("./assistant-panel").then((m) => ({ default: m.AssistantPanel })),
);
const ASSISTANT_LAUNCHER_ATTR = "data-assistant-launcher";

/**
 * Assistant — the "Ask about my work" launcher. Renders a quiet trigger and,
 * only once opened, lazy-loads the panel (keeps it off the initial bundle per
 * the ≤60KB assistant budget). Pressing "/" anywhere opens it, unless the user
 * is typing in a field. A11y: owns the close path so focus always returns to a
 * launcher the visitor can see (WCAG 2.4.3).
 */
export function Assistant() {
  const [open, setOpen] = useState(false);

  // Restore to the launcher that is actually visible at the current breakpoint.
  // getClientRects() is robust for both fixed and in-flow controls.
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
    // Mobile nav (and any other trigger) can open the same panel via this event.
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
        aria-expanded={open}
        aria-controls={open ? "assistant-panel-dialog" : undefined}
        title="Ask this site — a grounded assistant that answers only from this site's content (case studies, writing, résumé), with citations. Press ⌘K or / to open."
        aria-label="Ask this site — a grounded, cited assistant over this site's content. Press command-K or slash to open."
        className="icon-btn inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] text-ink-secondary hover:text-ink xl:h-9 xl:w-auto xl:gap-2 xl:rounded-[var(--radius-sm)] xl:border xl:border-border xl:bg-surface xl:px-2.5 xl:text-[0.8125rem] xl:text-ink-secondary xl:shadow-[var(--shadow-sm)] xl:hover:border-border-strong xl:hover:text-ink"
      >
        <Sparkles size={18} strokeWidth={1.5} className="xl:hidden" aria-hidden />
        <span className="hidden xl:inline">Ask this site</span>
        <kbd className="hidden rounded-[var(--radius-xs)] border border-border bg-bg-subtle px-1.5 font-mono text-[0.7rem] text-ink-tertiary xl:inline">
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
