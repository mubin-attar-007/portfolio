"use client";

// The slide-up assistant panel: header, streaming transcript, starter chips,
// citations, and the composer. Fully keyboard-accessible — focus trap, Escape
// to close, aria-live on the streamed answer, prefers-reduced-motion respected.

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useChat, type ChatMessage } from "./use-chat";
import { Markdown } from "./markdown";

const STARTERS = [
  "What has he shipped in production?",
  "Explain the DBWhisper RAG architecture",
  "Why should we hire him?",
  "What's his healthcare-AI experience?",
];

/** Return all tabbable elements inside a container (for the focus trap). */
function tabbables(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.offsetParent !== null || el === document.activeElement);
}

export function ChatPanel({
  open,
  onClose,
  returnFocusRef,
}: {
  open: boolean;
  onClose: () => void;
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const { messages, status, send, stop, reset } = useChat();
  const [draft, setDraft] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const streaming = status === "streaming";

  // Autoscroll the transcript as content streams in.
  useLayoutEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Auto-grow the composer to fit its content (capped by the CSS max-height),
  // so a short question never shows an awkward inner scrollbar.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

  // On open: focus the input and remember the trigger to restore focus later.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 40);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Escape to close + focus trap while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        returnFocusRef.current?.focus();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const items = tabbables(panelRef.current);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, returnFocusRef]);

  const submit = useCallback(() => {
    const text = draft.trim();
    if (!text || streaming) return;
    setDraft("");
    void send(text);
  }, [draft, streaming, send]);

  const onStarter = useCallback(
    (q: string) => {
      if (streaming) return;
      void send(q);
    },
    [streaming, send],
  );

  if (!open) return null;

  const empty = messages.length === 0;

  return (
    <>
      <div className="chat-scrim" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        className="chat-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Friday — Mubin's AI assistant"
      >
        {/* header */}
        <header className="chat-head">
          <div className="chat-head-id">
            <span className="chat-orb" aria-hidden />
            <div>
              <p className="chat-title">Friday</p>
              <p className="chat-sub">Mubin's AI · grounded in his real work, cites sources</p>
            </div>
          </div>
          <div className="chat-head-actions">
            {!empty && (
              <button type="button" className="chat-icon-btn" onClick={reset} title="New chat">
                <span className="mono">clear</span>
              </button>
            )}
            <button
              type="button"
              className="chat-icon-btn"
              onClick={() => {
                onClose();
                returnFocusRef.current?.focus();
              }}
              aria-label="Close assistant"
              title="Close"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* transcript */}
        <div className="chat-log" ref={logRef}>
          {empty ? (
            <div className="chat-empty">
              <p className="chat-empty-lead">
                I&apos;m <strong>Friday</strong>, Mubin&apos;s AI assistant. I answer from his real
                projects, case studies, and résumé — and I cite where each answer comes from. Ask me
                anything, or start here:
              </p>
              <div className="chat-starters">
                {STARTERS.map((q) => (
                  <button key={q} type="button" className="chat-chip" onClick={() => onStarter(q)}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => <Bubble key={m.id} message={m} />)
          )}
        </div>

        {/* composer */}
        <form
          className="chat-composer"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <textarea
            ref={inputRef}
            className="chat-input"
            rows={1}
            placeholder="Ask about his work, a project's architecture, his experience…"
            value={draft}
            maxLength={1000}
            aria-label="Ask the assistant a question about Mubin"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
          />
          {streaming ? (
            <button type="button" className="chat-send" onClick={stop} title="Stop">
              <span className="chat-stop-dot" aria-hidden /> Stop
            </button>
          ) : (
            <button type="submit" className="chat-send" disabled={!draft.trim()} title="Send">
              Send ▸
            </button>
          )}
        </form>
        <p className="chat-foot mono" aria-hidden>
          answers are grounded in real content · may be imperfect
        </p>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- bubble */

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  if (isUser) {
    return (
      <div className="chat-row chat-row-user">
        <div className="chat-bubble chat-bubble-user">{message.content}</div>
      </div>
    );
  }

  const showSkeleton = message.streaming && message.content.length === 0;

  return (
    <div className="chat-row chat-row-ai">
      <div className="chat-bubble chat-bubble-ai">
        <div
          className="chat-answer"
          aria-live={message.streaming ? "polite" : "off"}
          aria-busy={message.streaming}
        >
          {showSkeleton ? (
            <div className="chat-skeleton" aria-label="Assistant is thinking">
              <span />
              <span />
              <span />
            </div>
          ) : (
            <>
              <Markdown text={message.content} />
              {message.streaming && <span className="chat-caret" aria-hidden />}
            </>
          )}
        </div>

        {message.citations.length > 0 && !message.streaming && (
          <div className="chat-cites">
            <span className="chat-cites-label mono">sources</span>
            <ul className="chat-cites-list">
              {message.citations.map((c, i) => (
                <li key={i} className="chat-cite">
                  {c.source}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
