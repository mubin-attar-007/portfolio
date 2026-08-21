import { Section } from "@/components/layout/section";
import { TextLink } from "@/components/ui/text-link";
import { stagger } from "@/constants/page";
import { EyebrowChip } from "@/components/ui/eyebrow-chip";
import { flagshipHome } from "@/content/home-visual";
import { CapabilityVisual, type CapabilityVisualKind } from "./capability-visual";

/**
 * CapabilitySection — how the systems are engineered, in four cards.
 *
 * Kept LIGHT deliberately. The flagship band above and the closing CTA below are
 * the page's two dark plates, and the brief caps the homepage at two; a third
 * would turn an alternating rhythm into a stripe pattern.
 *
 * Each card leads with its own small diagram rather than an icon, because the
 * claim being made is mechanical: "deterministic safeguards" is a gate that one
 * of three requests does not get through, and drawing that says more than a
 * shield glyph does. Lucide is used elsewhere on the page for affordances
 * (arrows, states) — never as the primary illustration of an idea.
 *
 * Every card ends with a link to something that BACKS it: a note, an essay, the
 * eval registry, the stack page. A capability list with nothing behind it is a
 * skills wall, which is the thing this section replaces.
 */
export function CapabilitySection() {
  const m = flagshipHome.method;

  return (
    <Section id="method" space="lg" tone="subtle" ariaLabelledBy="method-title">
      <div className="max-w-[46ch]">
        <EyebrowChip>{m.eyebrow}</EyebrowChip>
        <h2
          id="method-title"
          className="mt-4 text-balance text-section font-[560] text-ink"
        >
          {m.title}
        </h2>
        <p className="mt-4 text-pretty text-lg text-ink-secondary">{m.body}</p>
      </div>

      <ul className="reveal-stagger mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
        {m.items.map((item, i) => (
          <li
            key={item.id}
            style={stagger(i)}
            className="flex flex-col rounded-[var(--radius-md)] border border-border bg-surface p-5 shadow-[var(--shadow-surface)] transition-[border-color,box-shadow] duration-base ease-[var(--ease-out)] hover:border-[color-mix(in_srgb,var(--color-accent)_32%,var(--color-border))] hover:shadow-[var(--shadow-surface-hover)]"
          >
            {/* The diagram sits in a recessed well so it reads as a readout
                inside the card rather than as an illustration on top of it. */}
            <div className="rounded-[var(--radius-sm)] border border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-accent)_7%,var(--color-bg-subtle)),var(--color-bg-subtle))] px-3 py-4">
              <CapabilityVisual kind={item.visual as CapabilityVisualKind} />
            </div>

            <h3 className="mt-5 text-[1.0625rem] font-[550] leading-snug tracking-[-0.015em] text-ink">
              {item.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-secondary">
              {item.body}
            </p>
            <TextLink href={item.proof.href} className="mt-4">
              {item.proof.label}
            </TextLink>
          </li>
        ))}
      </ul>
    </Section>
  );
}
