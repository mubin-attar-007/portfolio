"use client";

// Client-side chat state + streaming transport for the portfolio assistant.
// Talks to POST /api/chat, parses the SSE event stream (meta/token/sources/
// done), and exposes a small state machine the panel renders. Session memory
// lives in React state (cleared on reload) — no persistence, no PII.

import { useCallback, useRef, useState } from "react";

export type Citation = { source: string };
export type Sender = "user" | "assistant";
export type AssistantMode = "live" | "fallback" | "refusal" | null;

export type ChatMessage = {
  id: string;
  role: Sender;
  content: string;
  citations: Citation[];
  /** how the assistant answer was produced (for a small badge) */
  mode: AssistantMode;
  /** true while tokens are still streaming into this message */
  streaming: boolean;
};

let idCounter = 0;
const nextId = () => `m${Date.now()}-${idCounter++}`;

type SendState = "idle" | "streaming" | "error";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<SendState>("idle");
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus("idle");
    setMessages((prev) =>
      prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)),
    );
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || status === "streaming") return;

      const userMsg: ChatMessage = {
        id: nextId(),
        role: "user",
        content: trimmed,
        citations: [],
        mode: null,
        streaming: false,
      };
      const assistantId = nextId();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        citations: [],
        mode: "live",
        streaming: true,
      };

      // Build the history payload from prior turns (exclude the empty placeholder).
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setStatus("streaming");

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      const patch = (fn: (m: ChatMessage) => ChatMessage) =>
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? fn(m) : m)));

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: ctrl.signal,
        });

        if (!res.body) throw new Error("no-body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        // Parse SSE frames: blank-line-separated, "event:" + "data:" lines.
        const handleFrame = (frame: string) => {
          const lines = frame.split("\n");
          let event = "message";
          let data = "";
          for (const line of lines) {
            if (line.startsWith("event:")) event = line.slice(6).trim();
            else if (line.startsWith("data:")) data += line.slice(5).trim();
          }
          if (!data) return;
          let payload: unknown;
          try {
            payload = JSON.parse(data);
          } catch {
            return;
          }
          if (event === "meta") {
            const mode = (payload as { mode?: AssistantMode }).mode ?? "live";
            patch((m) => ({ ...m, mode }));
          } else if (event === "token") {
            const t = (payload as { text?: string }).text ?? "";
            if (t) patch((m) => ({ ...m, content: m.content + t }));
          } else if (event === "sources") {
            const citations = (payload as { citations?: Citation[] }).citations ?? [];
            patch((m) => ({ ...m, citations }));
          } else if (event === "done") {
            patch((m) => ({ ...m, streaming: false }));
          }
        };

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let sep: number;
          while ((sep = buffer.indexOf("\n\n")) !== -1) {
            const frame = buffer.slice(0, sep);
            buffer = buffer.slice(sep + 2);
            handleFrame(frame);
          }
        }
        if (buffer.trim()) handleFrame(buffer);

        patch((m) => ({ ...m, streaming: false }));
        setStatus("idle");
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") {
          patch((m) => ({ ...m, streaming: false }));
          setStatus("idle");
          return;
        }
        // Network-level failure (route always tries to stream, so this is rare).
        patch((m) => ({
          ...m,
          streaming: false,
          mode: "fallback",
          content:
            m.content ||
            "I couldn't reach the assistant just now. Please check your connection and try again — or explore Mubin's projects and FAQ on the page.",
        }));
        setStatus("error");
      } finally {
        abortRef.current = null;
      }
    },
    [messages, status],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setStatus("idle");
  }, []);

  return { messages, status, send, stop, reset };
}
