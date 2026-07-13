"use client";

import { Sparkles } from "lucide-react";

/**
 * MobileAssistantLauncher — a persistent, thumb-zone launcher (< md) for the
 * grounded assistant, the strongest live proof of the work. Rendered at the
 * <body> level (in the root layout, NOT inside the header) so its `fixed`
 * position anchors to the viewport rather than the header's backdrop-filter
 * containing block — no portal needed. Clicking dispatches the same
 * `open-assistant` event the mobile drawer uses; the Assistant panel listens
 * and opens. A11y: labelled button, keyboard operable; hidden from md up, where
 * the header trigger and "/" hotkey take over.
 */
export function MobileAssistantLauncher() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("open-assistant"))}
      aria-label="Ask about my work — an AI assistant grounded on this site"
      className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/95 px-3.5 py-2 text-sm text-ink shadow-[var(--shadow-md)] backdrop-blur transition-colors hover:border-border-strong md:hidden"
    >
      <Sparkles size={15} strokeWidth={1.6} className="text-accent" aria-hidden />
      Ask about my work
    </button>
  );
}
