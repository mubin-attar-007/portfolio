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
});
export type Project = z.infer<typeof ProjectSchema>;
