import { MAX_MESSAGE_CHARS } from "@/lib/ai/chat-contract";

/**
 * The window event any control dispatches to open the assistant panel: the
 * floating launcher, an "Ask AI about this" link on an article, or a script.
 * The panel's owner (`Assistant`, mounted once in the header) listens for it.
 */
export const ASSISTANT_OPEN_EVENT = "assistant:open";

/**
 * The older name for the same request. The mobile menu still sends it when it
 * hands off to the assistant after closing itself, so the owner listens for
 * both.
 */
export const LEGACY_OPEN_EVENT = "open-assistant";

/** What an open request may carry. */
export type AssistantOpenDetail = {
  /** A question to send as soon as the panel is open. */
  question?: string;
};

/**
 * Open the assistant panel from anywhere on the page.
 *
 * @param question Optional. Sent as the visitor's next question once the panel
 *   is open, exactly as if they had typed it; capped at the field's limit.
 */
export function openAssistant(question?: string): void {
  const detail: AssistantOpenDetail = question ? { question } : {};
  window.dispatchEvent(new CustomEvent(ASSISTANT_OPEN_EVENT, { detail }));
}

/**
 * The question an open request carries, capped at the field's limit, or null
 * when it carries none. The event is untrusted input from any script on the
 * page, so the detail is checked rather than cast.
 */
export function requestedQuestion(event: Event): string | null {
  if (!(event instanceof CustomEvent)) return null;
  const detail: unknown = event.detail;
  if (typeof detail !== "object" || detail === null || !("question" in detail)) return null;
  const { question } = detail;
  if (typeof question !== "string" || question.trim() === "") return null;
  return question.trim().slice(0, MAX_MESSAGE_CHARS);
}
