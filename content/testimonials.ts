import { z } from "zod";

/**
 * Testimonials — the honest "what people say" band. Real, permissioned quotes ONLY
 * (name + role + company, nothing invented — Ground Rule 3). Until real quotes land,
 * entries carry `sample: true`, which renders a visible "sample layout" label so
 * nothing masquerades as a genuine quote. To go live: replace these with real quotes
 * (drop `sample`), and the label disappears automatically.
 */
const TestimonialSchema = z.object({
  quote: z.string(),
  name: z.string(),
  role: z.string(),
  company: z.string(),
  /** true = placeholder layout, not a real quote (renders a visible "sample" label). */
  sample: z.boolean().optional(),
});
export type Testimonial = z.infer<typeof TestimonialSchema>;

const RAW = [
  {
    quote:
      "Ships fast without cutting the corners that matter — the kind of engineer who writes the validator, not just the prompt.",
    name: "—",
    role: "Engineering Manager",
    company: "reference available on request",
    sample: true,
  },
  {
    quote:
      "Turned a vague data problem into a deployed, measurable system in a week, and documented every decision along the way.",
    name: "—",
    role: "Senior Engineer",
    company: "reference available on request",
    sample: true,
  },
] as const;

export const testimonials: Testimonial[] = RAW.map((t) => TestimonialSchema.parse(t));
/** True while any entry is still a placeholder — drives the visible "sample" label. */
export const testimonialsAreSample = testimonials.some((t) => t.sample);
