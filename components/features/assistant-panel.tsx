"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * AssistantPanel — a grounded, cited assistant over this site's content
 * (AI_ASSISTANT.md §5). Calm slide-over (desktop) / bottom sheet (mobile), the
 * one place a shadow is allowed. Streams from /api/chat over SSE; degrades to
 * the server's cited fallback on quota/error. A11y: modal dialog, focus trap,
 * Escape to close, focus restore, aria-live on the streamed answer.
 */

const STARTERS = [
  "What has Mubin shipped in production?",
  "Why a deterministic SQL validator instead of trusting the LLM?",
  "How does TradePulse avoid look-ahead bias?",
  "What real production bugs has he found and fixed?",
];

type Source = { source: string };
type Msg = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  mode?: "live" | "fallback" | "refusal";
  streaming?: boolean;
};

function tabbables(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.offsetParent !== null);
}

export function AssistantPanel({
  onClose,
  returnFocusRef,
}: {
  onClose: () => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  // focus the input on open; trap focus + Escape while open; restore on close
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 30);
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
        const first = items[0]!;
        const last = items[items.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, returnFocusRef]);

  // autoscroll the transcript as tokens arrive (not on the empty state, which
  // would shove the starter questions out of view)
  useEffect(() => {
    if (messages.length === 0) return;
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || busy) return;
      setBusy(true);
      const history: Msg[] = [...messages, { role: "user", content: q }];
      setMessages([...history, { role: "assistant", content: "", streaming: true }]);

      const update = (patch: Partial<Msg>) =>
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1]!; // an assistant message was just appended
          next[next.length - 1] = { ...last, ...patch };
          return next;
        });

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        const reader = res.body?.getReader();
        if (!reader) throw new Error("no stream");
        const decoder = new TextDecoder();
        let buffer = "";
        let text = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";
          for (const raw of events) {
            const evLine = raw.match(/event: (.*)/)?.[1];
            const dataLine = raw.match(/data: (.*)/)?.[1];
            if (!evLine || !dataLine) continue;
            const data = JSON.parse(dataLine);
            if (evLine === "meta") update({ mode: data.mode });
            else if (evLine === "token") {
              text += data.text;
              update({ content: text });
            } else if (evLine === "sources") update({ sources: data.citations });
            else if (evLine === "done") update({ streaming: false });
          }
        }
        update({ streaming: false });
      } catch {
        update({
          content:
            "The assistant is resting. Everything it would say is on the page — try the work and writing.",
          streaming: false,
          mode: "fallback",
        });
      } finally {
        setBusy(false);
      }
    },
    [busy, messages],
  );

  const empty = messages.length === 0;

  // Portal to <body>: the header pill has backdrop-filter, which would otherwise
  // make it the containing block for this fixed panel and mis-anchor it.
  return createPortal(
    <>
      <div className="fixed inset-0 z-50 bg-ink/15" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Ask about Mubin's work"
        className="fixed inset-x-0 bottom-0 z-50 flex h-[85dvh] flex-col overflow-hidden rounded-t-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-overlay)] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-auto sm:max-h-[calc(100dvh-6rem)] sm:w-[400px] sm:rounded-[var(--radius-lg)]"
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <p className="text-sm font-medium text-ink">Ask about my work</p>
            <p className="font-mono text-xs text-ink-tertiary">Answers only from this site</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-ink-secondary hover:text-ink"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </header>

        <div ref={logRef} className="flex-1 overflow-y-auto px-5 py-4">
          {empty ? (
            <div>
              <p className="text-sm text-ink-secondary">
                A grounded assistant over this site&apos;s case studies, writing, and résumé. Ask
                anything, or start here:
              </p>
              <ul className="mt-4 flex flex-col gap-2">
                {STARTERS.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => ask(s)}
                      className="w-full rounded-[var(--radius-md)] border border-border bg-bg-subtle px-3 py-2 text-left text-sm text-ink transition-colors hover:border-border-strong"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <p key={i} className="self-end rounded-[var(--radius-md)] bg-bg-subtle px-3 py-2 text-sm text-ink">
                    {m.content}
                  </p>
                ) : (
                  <div key={i}>
                    {m.mode === "fallback" ? (
                      <p className="mb-1 font-mono text-xs text-ink-tertiary">from site search</p>
                    ) : null}
                    <div
                      className="whitespace-pre-wrap text-sm leading-relaxed text-ink-secondary"
                      aria-live={m.streaming ? "polite" : "off"}
                    >
                      {m.content}
                      {m.streaming && !m.content ? <span className="text-ink-tertiary">…</span> : null}
                    </div>
                    {m.sources && m.sources.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.sources.map((s, si) => (
                          <span
                            key={si}
                            className="rounded-[var(--radius-sm)] border border-border px-2 py-0.5 font-mono text-xs text-ink-tertiary"
                          >
                            {s.source}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(draft);
            setDraft("");
          }}
          className="flex items-end gap-2 border-t border-border px-5 py-3"
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            maxLength={400}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask(draft);
                setDraft("");
              }
            }}
            placeholder="Ask about a project, a decision, or his experience…"
            aria-label="Your question"
            className="max-h-28 flex-1 resize-none rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm text-ink outline-none focus-visible:border-border-strong"
          />
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            className="inline-flex h-9 items-center rounded-[var(--radius-md)] bg-accent px-3 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            Ask
          </button>
        </form>
        <p className="px-5 pb-3 font-mono text-xs text-ink-tertiary">
          Grounded in this site&apos;s content · may be imperfect · answers aren&apos;t stored.
        </p>
      </div>
    </>,
    document.body,
  );
}
