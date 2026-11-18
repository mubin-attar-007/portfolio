"use client";

import { Sparkles } from "lucide-react";
import { openAssistant } from "@/components/assistant/open-assistant";
import { cx } from "@/components/ui/cx";

/**
 * Opens the site's assistant on this article. Nothing is sent: the panel opens
 * on its starters for the page (the assistant knows where it was opened), so an
 * exploratory click never spends an answer; a starter that shows its question
 * sends it when chosen. The only client code in the "Ask AI about this" block.
 *
 * `layout="rows"` is the sidebar row (an ink tile beside the label);
 * `"chips"` is the dark pill of the compact block under a phone's header.
 *
 * A launcher (`data-assistant-launcher`): closing the panel returns focus to
 * this button (WCAG 2.4.3), and hovering or focusing it warms the panel's code.
 */
export function AskAssistantButton({ label, layout }: { label: string; layout: "rows" | "chips" }) {
  const rows = layout === "rows";
  return (
    <button
      type="button"
      data-assistant-launcher=""
      aria-haspopup="dialog"
      onClick={() => openAssistant()}
      className={cx(
        "group flex items-center text-left text-sm font-medium transition-colors duration-fast ease-[var(--ease-out)] active:scale-[var(--press-scale)]",
        rows
          ? "min-h-9 w-full gap-2.5 rounded-[var(--radius-md)] text-ink hover:text-accent"
          : "min-h-8 gap-2 rounded-[var(--radius-pill)] bg-ink py-1 pr-3 pl-1.5 text-white",
      )}
    >
      <span aria-hidden="true" className="grid size-6 place-items-center rounded-[var(--radius-sm)] bg-ink text-white">
        <Sparkles size={13} strokeWidth={1.8} />
      </span>
      {label}
    </button>
  );
}
