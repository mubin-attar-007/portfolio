"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * CopyEmail — copies the contact address to the clipboard with a transient
 * "Copied" state (F-08). Sits beside the mailto link so webmail-on-desktop users
 * (for whom `mailto:` silently fails) can still grab the address.
 * A11y: labelled button; the state change is announced via aria-live.
 */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — the mailto link beside this remains the fallback */
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? "Email address copied to clipboard" : `Copy email address ${email}`}
      className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] font-mono text-sm text-ink-tertiary transition-colors hover:text-ink focus-visible:text-ink"
    >
      {copied ? <Check size={14} strokeWidth={1.6} /> : <Copy size={14} strokeWidth={1.6} />}
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
