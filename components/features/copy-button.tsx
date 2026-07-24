"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * CopyButton — copies text to the clipboard with a transient "Copied" state.
 * A11y: labelled button; the state change is announced via aria-live.
 */
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? "Copied to clipboard" : "Copy code"}
        className="inline-flex h-7 items-center gap-1.5 rounded-[var(--radius-sm)] px-2 font-mono text-xs text-ink-tertiary transition-colors hover:text-ink"
      >
        {copied ? <Check size={13} strokeWidth={1.5} aria-hidden /> : <Copy size={13} strokeWidth={1.5} aria-hidden />}
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </>
  );
}
