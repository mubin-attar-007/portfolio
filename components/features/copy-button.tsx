"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { cx } from "@/components/ui/cx";

/** How long the "Copied" (or "Couldn't copy") state holds before the button resets. */
const RESET_MS = 2000;

/** The label when neither copy path reaches the clipboard. */
const FAILED_LABEL = "Couldn't copy";

/**
 * Copy through the Clipboard API, or — where it is missing or refused (an
 * insecure origin, a restrictive permissions policy) — through a selected,
 * off-screen textarea. True when the text reached the clipboard.
 */
async function writeClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      area.remove();
    }
  }
}

/**
 * CopyButton — copies text to the clipboard with a transient "Copied" state.
 * The icon swaps copy → check with the spring (prototype `.copy-btn`).
 *
 * Props:
 * - `text` — what is copied, verbatim; with `icon="link"` a site path ("/x") is
 *   copied as the full URL.
 * - `label` — the visible label and accessible name ("Copy code", "Copy link").
 * - `copiedLabel` — the label while copied (default "Copied").
 * - `icon` — `copy` (default) or `link`.
 * - `variant` — `bare` (default, a quiet toolbar button) or `pill` (a white
 *   pill with the card hairline, for an article footer).
 *
 * A11y: a labelled button; the state change is announced in a polite live
 * region. If the browser refuses both copy paths the label says so ("Couldn't
 * copy"), so the button is never a silent no-op. Reduced motion: the global
 * rules make the swap instant.
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
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const copied = state === "copied";
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  async function onCopy() {
    // A link (`icon="link"`) may be a site path ("/x"): it is copied as a full
    // URL. Anything else is copied exactly as given: code often starts with
    // "/" (a `//` or `/**` comment) and must never be read as a path.
    const value = icon === "link" && text.startsWith("/") ? new URL(text, window.location.origin).href : text;
    setState((await writeClipboard(value)) ? "copied" : "failed");
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setState("idle"), RESET_MS);
  }

  const shown = state === "copied" ? copiedLabel : state === "failed" ? FAILED_LABEL : label;

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
        <span>{shown}</span>
      </button>
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {state === "idle" ? "" : shown}
      </span>
    </>
  );
}
