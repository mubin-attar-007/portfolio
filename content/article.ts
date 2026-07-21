import type { Project } from "./schema";

/**
 * Article furniture copy — every user-facing string in the shared article
 * header and footer. Components own layout; this module owns words (CLAUDE.md
 * content law). Keeping the three article templates' labels in ONE object is
 * also what stops them drifting back apart: a case study, an essay and a note
 * literally cannot use different words for the same affordance.
 *
 * Nothing here asserts a fact about my work. These are navigation labels and
 * format strings only — no metric, date, employer or capability is introduced.
 */

/**
 * Human labels for `Project["status"]`. The raw enum values are slugs
 * ("active-development"); a kicker should read as English.
 */
export const PROJECT_STATUS_LABEL: Record<Project["status"], string> = {
  production: "Production",
  "active-development": "Active development",
  experiment: "Experiment",
  archived: "Archived",
};

/** Kickers that name what KIND of page the reader has landed on. */
export const ARTICLE_KICKER = {
  note: "Note",
} as const;

export const ARTICLE_META = {
  /**
   * Reading time. The tilde is load-bearing: this is an estimate from a word
   * count (lib/reading-time.ts), not a measurement, and the label should not
   * pretend otherwise.
   */
  readingTime: (minutes: number) => `~${minutes} min read`,
  /** Prefix for a revision date, so it can't be mistaken for the publish date. */
  updated: (date: string) => `Updated ${date}`,
  /** Label for the external link a note is reacting to. */
  source: "Source",
} as const;

/**
 * End-of-article footer copy.
 *
 * `previous`/`next` are named PER COLLECTION rather than shared, because the
 * three indexes are not ordered the same way and one pair of labels would
 * therefore have to lie about one of them. Writing and notes are sorted
 * newest-first, so their neighbours are genuinely "Newer" and "Older" — a real
 * fact about publication order. Work is sorted by a curated `order` field with
 * no date meaning, so calling an adjacent case study "Older" would assert
 * something untrue; it gets the neutral "Previous"/"Next".
 *
 * Naming the direction in TEXT also keeps it out of the arrows alone, which
 * convey nothing to a screen reader.
 */
export const ARTICLE_FOOTER = {
  heading: "Keep reading",
  work: { index: "All work", label: "case studies", previous: "Previous", next: "Next" },
  writing: { index: "All writing", label: "writing", previous: "Newer", next: "Older" },
  notes: { index: "All notes", label: "notes", previous: "Newer", next: "Older" },
} as const;

/** Which collection an article belongs to — drives its footer labels and index href. */
export type ArticleCollection = keyof Pick<typeof ARTICLE_FOOTER, "work" | "writing" | "notes">;
