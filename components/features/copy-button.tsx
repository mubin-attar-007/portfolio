"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * CopyButton — copies text to the clipboard with a transient "Copied" state.
 * A11y: labelled button; the state change is announced via aria-live.
 */
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? "Copied to clipboard" : "Copy code"}
      className="inline-flex h-7 items-center gap-1.5 rounded-[var(--radius-sm)] px-2 font-mono text-xs text-ink-tertiary transition-colors hover:text-ink"
    >
      {copied ? <Check size={13} strokeWidth={1.5} /> : <Copy size={13} strokeWidth={1.5} />}
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
