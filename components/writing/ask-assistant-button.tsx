"use client";

import { Sparkles } from "lucide-react";
import { openAssistant } from "@/components/assistant/open-assistant";

/**
 * Opens the site's assistant with a question about this article already
 * asked. The only client code in the sidebar's "Ask AI about this" block.
 */
export function AskAssistantButton({ label, question }: { label: string; question: string }) {
  return (
    <button
      type="button"
      onClick={() => openAssistant(question)}
      className="group flex min-h-8 items-center gap-2 rounded-[var(--radius-pill)] bg-ink py-1 pr-3 pl-1.5 text-left text-sm font-medium text-white transition-colors duration-fast ease-[var(--ease-out)] active:scale-[var(--press-scale)] xl:min-h-9 xl:w-full xl:gap-2.5 xl:rounded-[var(--radius-md)] xl:bg-transparent xl:p-0 xl:text-ink xl:hover:text-accent"
    >
      <span aria-hidden="true" className="grid size-6 place-items-center rounded-[var(--radius-sm)] bg-ink text-white">
        <Sparkles size={13} strokeWidth={1.8} />
      </span>
      {label}
    </button>
  );
}
