"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * CopyEmail — copies the contact address to the clipboard with a transient
 * "Copied" state (F-08). Sits beside the mailto link so webmail-on-desktop users
 * (for whom `mailto:` silently fails) can still grab the address.
 * A11y: labelled button; the state change is announced via aria-live.
 */
export function CopyEmail({ email }: { email: string }) {
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
      await navigator.clipboard.writeText(email);
      setCopied(true);
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — the mailto link beside this remains the fallback */
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? "Email address copied to clipboard" : `Copy email address ${email}`}
        className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] font-mono text-sm text-ink-tertiary transition-colors hover:text-ink focus-visible:text-ink"
      >
        {copied ? <Check size={14} strokeWidth={1.6} aria-hidden /> : <Copy size={14} strokeWidth={1.6} aria-hidden />}
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {copied ? "Email address copied to clipboard" : ""}
      </span>
    </>
  );
}
