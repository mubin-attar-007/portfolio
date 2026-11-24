/**
 * The assistant's interface copy, in one place so a wording change is one edit.
 *
 * What an answer says — including the failure messages a turn can carry — lives
 * with the request logic in `components/features/assistant-panel.tsx`: it is
 * part of the conversation, not of the frame around it.
 *
 * GATE marks a string that a browser gate matches by name (`scripts/a11y.mjs`,
 * `scripts/interaction-audit.mjs`, `scripts/smoke.mjs`). Renaming one needs the
 * gate updated in the same change.
 */
import { GEMINI_TIER } from "@/lib/ai/provider-terms";

export const ASSISTANT_COPY = {
  /** GATE: the launcher's accessible name must start with this. */
  trigger: "Ask this site",
  /** GATE: the dialog's name must start with "Ask about". */
  title: "Ask about Mubin's work",
  /** One line in the 440px drawer, beside Clear and Close. */
  subtitle: "Answers from this site, with sources",
  /** The dialog's description, read once when it opens. */
  description:
    "Ask about Mubin's projects, experience and writing. Answers link the pages they come from. Press Escape to close.",
  intro:
    "Ask about Mubin's products, projects, experience and writing, or how to hire him. Answers can be imperfect, so check the page each one cites.",
  /** The intro on a case study or an article: its starters are that page's. */
  introOnPage:
    "Ask about this page, or anything else on Mubin's site. Answers can be imperfect, so check the page each one cites.",
  startersLabel: "Try a question",
  /** GATE: the transcript's role is `log`; this names it for the tab stop. */
  conversation: "Conversation",
  you: "You asked:",
  answer: "Answer:",
  searching: "Searching the site",
  /** The pending line once no text has arrived for a while (SLOW_AFTER_MS): calm, no new motion. */
  slow: "Taking longer than usual",
  /** The status line while an answer is pending, read by screen readers. */
  statusSearching: "Searching the site and writing a cited answer.",
  /** Replaces it once, when the answer is slow; it stays until the answer ends, so it is read once. */
  statusSlow: "This answer is taking longer than usual.",
  statusReady: "Ready to search this site.",
  sources: "Sources",
  /** The group of next steps under an answer. */
  actions: "Next steps",
  /** The curated questions under the latest answer. */
  followUps: "Ask next",
  copy: "Copy answer",
  copied: "Answer copied",
  copyFailed: "Copy failed. Your browser blocked the clipboard.",
  jump: "Jump to latest",
  retry: "Try again",
  /** GATE */
  stop: "Stop answering",
  clear: "Clear",
  /** GATE */
  clearLabel: "Clear conversation",
  /** GATE */
  close: "Close",
  /** GATE */
  formLabel: "Ask this site a question",
  /** GATE */
  fieldLabel: "Your question",
  placeholder: "Ask about a project or a decision…",
  /** GATE: the submit button's exact name. */
  send: "Ask",
  /** The answers are a model's: say so, and point at the check. */
  disclosure: "AI-generated from this site's pages; check the sources.",
  /**
   * Matches what /privacy says about assistant messages, for the Gemini tier the
   * key runs on (lib/ai/provider-terms.ts): on the free tier Google may use what
   * is sent, and "this site doesn't store it" alone would hide that.
   */
  privacy:
    GEMINI_TIER === "free"
      ? "This site doesn't store your question, but Google may use it to improve Gemini, so don't share anything private."
      : "Your question is used for one answer. This site doesn't store it.",
} as const;
