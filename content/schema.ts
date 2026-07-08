import { z } from "zod";

/**
 * Content schemas (Zod) — the validated shape of everything in content/.
 * `.parse()` at module load means the build FAILS on invalid content, which is
 * the intent of ADR-003 adapted to our next-mdx-remote stack.
 */

export const MetricSchema = z.object({
  label: z.string(),
  value: z.string(),
  before: z.string().optional(),
  direction: z.enum(["up-good", "down-good"]).optional(),
  /** REQUIRED — how it was measured, over what sample/period. No number ships without one. */
  method: z.string().min(1),
});
export type Metric = z.infer<typeof MetricSchema>;

export const ProjectSchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string().max(200),
  status: z.enum(["production", "active-development", "experiment", "archived"]),
  role: z.string(),
  timeline: z.string(),
  featured: z.boolean().default(false),
  order: z.number(),
  systems: z.array(z.string()).min(1),
  metrics: z.array(MetricSchema),
  links: z.object({
    live: z.string().url().optional(),
    repo: z.string().url().optional(),
  }),
  diagram: z.string().optional(),
  /** Real, dated milestones (newest first), derived from git history / shipped work. */
  changelog: z
    .array(z.object({ date: z.string(), summary: z.string() }))
    .default([]),
});
export type Project = z.infer<typeof ProjectSchema>;

export const WritingSchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string().max(220),
  date: z.string(),
  updated: z.string().optional(),
  category: z.enum(["essay", "guide", "note"]),
  topics: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});
export type WritingMeta = z.infer<typeof WritingSchema>;

/**
 * A short note (TIL / digital garden). Distinct from Writing: micro-length,
 * tag-indexed, optionally sourced. `date` and `tags` are required so the index
 * can always group + filter — build fails if a note omits them.
 */
export const NoteSchema = z.object({
  slug: z.string(),
  title: z.string(),
  date: z.string(),
  tags: z.array(z.string()).min(1),
  /** Optional external link the note reacts to (a paper, doc, repo). */
  source: z.string().url().optional(),
  draft: z.boolean().default(false),
});
export type NoteMeta = z.infer<typeof NoteSchema>;

/**
 * /now front-matter. `updated` is REQUIRED (Zod fails the build if omitted) so
 * the "Last updated" line can never go silently stale — we do not trust file
 * mtime, which resets to deploy time on a fresh Vercel checkout.
 */
export const NowSchema = z.object({
  updated: z.string(),
  lede: z.string(),
});
export type NowMeta = z.infer<typeof NowSchema>;

/**
 * One row of the eval registry. `status` drives the visual state — an
 * `in-progress` row renders muted (infrastructure awaiting data), never a
 * fake-green result. No number is invented: `result` states real progress.
 */
export const EvalSchema = z.object({
  system: z.string(),
  benchmark: z.string(),
  metric: z.string(),
  result: z.string(),
  status: z.enum(["in-progress", "complete", "planned"]),
  date: z.string().optional(),
  note: z.string().optional(),
  /** Optional link — external URL or an on-site path (e.g. /work/dbwhisper). */
  link: z.string().optional(),
});
export type EvalRow = z.infer<typeof EvalSchema>;

/** One phase of the timeline. Body carries Built/Learned/Mistake/Changed lines. */
export const TimelineSchema = z.object({
  period: z.string(),
  role: z.string(),
  org: z.string().optional(),
  order: z.number(),
  built: z.string(),
  learned: z.string(),
  mistake: z.string(),
  changed: z.string(),
});
export type TimelinePhase = z.infer<typeof TimelineSchema>;
