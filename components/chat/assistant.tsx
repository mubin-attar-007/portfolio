"use client";

// The floating assistant: a bottom-right trigger button (teal glow) that opens
// the streaming chat panel. The heavy panel (+ streaming logic + markdown) is
// code-split via next/dynamic with ssr:false so NONE of it ships in the initial
// landing bundle — it loads only when a visitor first opens the assistant.

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";

const ChatPanel = dynamic(
  () => import("./chat-panel").then((m) => m.ChatPanel),
  { ssr: false },
);

export function Assistant() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // keep panel in tree after first open
  const btnRef = useRef<HTMLButtonElement>(null);

  const openPanel = useCallback(() => {
    setMounted(true);
    setOpen(true);
  }, []);
  const closePanel = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="chat-fab"
        data-open={open || undefined}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Ask about Mubin — open AI assistant"
        onClick={() => (open ? closePanel() : openPanel())}
      >
        <span className="chat-fab-glow" aria-hidden />
        <span className="chat-fab-icon" aria-hidden>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M3 4.5A1.5 1.5 0 0 1 4.5 3h11A1.5 1.5 0 0 1 17 4.5v7A1.5 1.5 0 0 1 15.5 13H8l-3.5 3v-3H4.5A1.5 1.5 0 0 1 3 11.5v-7Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="7" cy="8" r="1" fill="currentColor" />
            <circle cx="10" cy="8" r="1" fill="currentColor" />
            <circle cx="13" cy="8" r="1" fill="currentColor" />
          </svg>
        </span>
        <span className="chat-fab-label">Ask about Mubin</span>
      </button>

      {mounted && <ChatPanel open={open} onClose={closePanel} returnFocusRef={btnRef} />}
    </>
  );
}
