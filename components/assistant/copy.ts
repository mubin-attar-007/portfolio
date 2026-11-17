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
export const ASSISTANT_COPY = {
  /** GATE: the launcher's accessible name must start with this. */
  trigger: "Ask this site",
  /** GATE: the dialog's name must start with "Ask about". */
  title: "Ask about Mubin's work",
  subtitle: "Answers come from this site and cite the page they used",
  /** The dialog's description, read once when it opens. */
  description:
    "Ask about Mubin's projects, experience and writing. Answers link the pages they come from. Press Escape to close.",
  intro:
    "Ask about Mubin's projects, decisions, experience and writing. Answers can be imperfect, so check the page each one cites.",
  startersLabel: "Try a question",
  /** GATE: the transcript's role is `log`; this names it for the tab stop. */
  conversation: "Conversation",
  you: "You asked:",
  answer: "Answer:",
  searching: "Searching the site",
  sources: "Sources",
  sourcesFrom: "From",
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
  /** Matches what /privacy says about assistant messages. */
  privacy: "Your question is used for one answer. This site doesn't store it.",
} as const;
