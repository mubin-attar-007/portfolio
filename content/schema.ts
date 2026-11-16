import { z } from "zod";
import { SEO_LIMITS } from "@/constants/seo";

/**
 * Content schemas (Zod) — the validated shape of everything in content/.
 * `.parse()` at module load means the build FAILS on invalid content, which is
 * the intent of ADR-003 adapted to our next-mdx-remote stack.
 */

/**
 * A summary that is also the page's search, social and feed description, so it
 * is held to the snippet limit here rather than cut later.
 */
const Description = z.string().max(SEO_LIMITS.descriptionMax);

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
  /** The case-study lede, and the page's search and social description. */
  summary: Description,
  /**
   * What the project is, not whether its host is awake today. `deployed-demo`
   * is a public deployment on free-tier hosting: it can sleep or be paused, so
   * it claims no uptime and no operating users. A demo that is down drops
   * `links.live` and keeps its source, and its recording if it has one.
   */
  status: z.enum(["deployed-demo", "active-development", "experiment", "archived"]),
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
  /**
   * The product recording the case study plays, if the project has one:
   * `public/demos/<slug>.webm` with its captions (`.vtt`) and its poster
   * (`.webp`, also the card capture). A recording is evidence, so before one is
   * published, every frame and caption is checked against the project's claim
   * audit; one that shows a withdrawn figure or claim is removed, not captioned
   * (spec/CONTENT_MODEL.md §4).
   */
  recording: z
    .object({
      /** What the recording SHOWS. */
      alt: z.string().min(1),
      /** The captured surface, and any on-screen statement the page does not stand behind. */
      caption: z.string().min(1),
      width: z.number(),
      height: z.number(),
    })
    .optional(),
  /**
   * The project preview shared by the homepage and work index.
   *
   * It lives on the project rather than in a page's copy file because two
   * surfaces render it (the homepage and /work), and a card definition
   * kept next to one of them is a card definition the other will eventually
   * contradict. `summary` is deliberately NOT reused here: it is a
   * 200-character paragraph written for the case-study header and reads as a
   * wall in a project preview.
   */
  card: z.object({
    /** One line. What the product is, before any mechanism is named. */
    definition: z.string().max(90),
    /** The technical family — not a tag cloud. */
    category: z.string(),
    /** The decision explained by the project's first metric and its method. */
    decision: z.object({
      title: z.string().min(1),
      /** Numeric results retain their value and method link in the preview. */
      showResult: z.boolean().default(false),
    }),
    /** A real product or website capture, served from /public. */
    shot: z.object({ src: z.string(), width: z.number(), height: z.number() }),
    /** Describes what the screenshot SHOWS. Never the project name repeated. */
    alt: z.string().min(1),
    /** Identifies the actual captured surface; never an implied live result. */
    caption: z.string().min(1),
  }),
  /** Real, dated milestones (newest first), derived from git history / shipped work. */
  changelog: z
    .array(z.object({ date: z.string(), summary: z.string() }))
    .default([]),
});
export type Project = z.infer<typeof ProjectSchema>;

export const WritingSchema = z.object({
  slug: z.string(),
  title: z.string(),
  /** The article lede, and its search, social and feed description. */
  summary: Description,
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
  /**
   * Optional one-line description for search, social cards and the feeds.
   * Without it, the note is described by its opening sentences
   * (`noteDescription` in lib/notes.ts) — never by its tags.
   */
  summary: Description.optional(),
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
  /**
   * "Currently exploring" — structured rather than a markdown list in the body,
   * because the homepage shows the same three themes. A list that lives in prose
   * can only be duplicated; as data it has exactly one source, and /now and the
   * homepage cannot drift apart.
   */
  exploring: z
    .array(z.object({ title: z.string(), body: z.string() }))
    .default([]),
});

/**
 * The counted outcome of a run: how many cases met the metric's pass condition,
 * out of how many were scored. Every label and percentage a page shows for the
 * run is derived from these counts (content/evals.ts), so a figure is written
 * down once.
 */
export const EvalScoreSchema = z
  .object({
    /** Cases that met the pass condition (a matching result, an expected denial). */
    passed: z.number().int().nonnegative(),
    /** Cases scored: the denominator. */
    scored: z.number().int().positive(),
    /** Cases drawn before exclusions. Omitted when nothing was excluded. */
    sampled: z.number().int().positive().optional(),
  })
  .refine((s) => s.passed <= s.scored, { message: "passed cannot exceed scored" })
  .refine((s) => s.sampled === undefined || s.sampled >= s.scored, {
    message: "sampled cannot be smaller than scored",
  });
export type EvalScore = z.infer<typeof EvalScoreSchema>;

/**
 * Why a published result was withdrawn: when this registry retired it, the
 * reason in a sentence or two, and the audit that withdrew it.
 */
export const EvalRetirementSchema = z.object({
  date: z.string(),
  reason: z.string().min(1),
  /** The audit that withdrew the figure — a permanent URL (a fixed commit). */
  link: z.string().url(),
});

/**
 * One row of the eval registry. `status` drives the visual state — an
 * `in-progress` row renders muted (infrastructure awaiting data), never a
 * fake-green result. No number is invented: `result` states real progress.
 *
 * A `retired` row is a result that turned out not to hold. It stays in the
 * registry, muted, with the reason and the audit that withdrew it, and it
 * carries no figure at all: its `result` is a word, and it has no `score`.
 */
export const EvalSchema = z
  .object({
    system: z.string(),
    benchmark: z.string(),
    metric: z.string(),
    result: z.string(),
    /** The counts behind `result`, for a run that scores cases. */
    score: EvalScoreSchema.optional(),
    status: z.enum(["in-progress", "complete", "planned", "retired"]),
    date: z.string().optional(),
    note: z.string().optional(),
    /** Optional link — external URL or an on-site path (e.g. /work/dbwhisper). */
    link: z.string().optional(),
    /** Required on a retired row, and only there. */
    retired: EvalRetirementSchema.optional(),
  })
  .superRefine((row, ctx) => {
    if ((row.status === "retired") !== (row.retired !== undefined)) {
      ctx.addIssue({
        code: "custom",
        path: ["retired"],
        message: "a retired row, and only a retired row, states why it was retired",
      });
    }
    if (row.status === "retired" && (row.score !== undefined || /\d/.test(row.result))) {
      ctx.addIssue({
        code: "custom",
        path: ["result"],
        message: "a retired row publishes no figure: no score, and no digits in its result",
      });
    }
    if (row.score && !row.result.includes(`${row.score.passed}/${row.score.scored}`)) {
      ctx.addIssue({
        code: "custom",
        path: ["result"],
        message: "a scored row's result must show its passed/scored counts",
      });
    }
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
