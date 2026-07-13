import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { testimonials, testimonialsAreSample } from "@/content/testimonials";

/**
 * Testimonials — the honest "what people say" band. Renders nothing when the list
 * is empty (no placeholder UI on prod). While entries are samples, a visible label
 * makes unmistakable that these are a layout, not real quotes (F-06 / Ground Rule 3).
 * Quiet cards (surface bg, 1px border) — no lift, no glow (DESIGN §3/§4).
 */
export function Testimonials() {
  if (testimonials.length === 0) return null;
  return (
    <Section space="lg" ariaLabel="References" className="reveal">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <SectionHeading kicker="References">What people say</SectionHeading>
        {testimonialsAreSample ? (
          <span className="rounded-[var(--radius-sm)] border border-dashed border-border-strong px-2.5 py-1 font-mono text-xs text-ink-tertiary">
            Sample layout — real, named references on request
          </span>
        ) : null}
      </div>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2">
        {testimonials.map((t, i) => (
          <li key={i} className="flex flex-col rounded-[var(--radius-md)] border border-border bg-surface p-6">
            <blockquote className="text-lg text-ink-secondary">“{t.quote}”</blockquote>
            <figcaption className="mt-5 text-sm">
              {t.name !== "—" ? <span className="font-medium text-ink">{t.name} · </span> : null}
              <span className="text-ink-tertiary">
                {t.role}, {t.company}
              </span>
            </figcaption>
          </li>
        ))}
      </ul>
    </Section>
  );
}
