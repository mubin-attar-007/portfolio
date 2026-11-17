"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { cx } from "@/components/ui/cx";

/** How long the "Copied" state holds before the button resets. */
const RESET_MS = 2000;

/**
 * CopyButton — copies text to the clipboard with a transient "Copied" state.
 * The icon swaps copy → check with the spring (prototype `.copy-btn`).
 *
 * Props:
 * - `text` — what is copied.
 * - `label` — the visible label and accessible name ("Copy code", "Copy link").
 * - `copiedLabel` — the label while copied (default "Copied").
 * - `icon` — `copy` (default) or `link`.
 * - `variant` — `bare` (default, a quiet toolbar button) or `pill` (a white
 *   pill with the card hairline, for an article footer).
 *
 * A11y: a labelled button; the state change is announced in a polite live
 * region. Reduced motion: the global rules make the swap instant.
 */
export function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied",
  icon = "copy",
  variant = "bare",
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  icon?: "copy" | "link";
  variant?: "bare" | "pill";
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  async function onCopy() {
    try {
      // A relative path is resolved against the page, so a caller can pass "/x".
      const value = text.startsWith("/") ? new URL(text, window.location.origin).href : text;
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), RESET_MS);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  const Idle = icon === "link" ? Link2 : Copy;
  const glyph = "col-start-1 row-start-1 transition-[opacity,transform] duration-[var(--motion-slow)] ease-[var(--spring)]";

  return (
    <>
      <button
        type="button"
        onClick={onCopy}
        className={cx(
          "inline-flex items-center gap-1.5 transition-colors duration-fast ease-[var(--ease-out)] active:scale-[var(--press-scale)]",
          variant === "pill"
            ? "h-8 rounded-[var(--radius-pill)] bg-surface px-3 text-sm font-medium text-ink shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-lift)]"
            : "h-7 rounded-[var(--radius-sm)] px-2 font-mono text-xs text-ink-tertiary hover:text-ink",
        )}
      >
        <span aria-hidden="true" className="grid">
          <Idle size={13} strokeWidth={1.6} className={cx(glyph, copied && "scale-50 opacity-0")} />
          <Check size={13} strokeWidth={1.8} className={cx(glyph, !copied && "scale-50 opacity-0")} />
        </span>
        <span>{copied ? copiedLabel : label}</span>
      </button>
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {copied ? copiedLabel : ""}
      </span>
    </>
  );
}
