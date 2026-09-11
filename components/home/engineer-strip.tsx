import Image from "next/image";
import { Section } from "@/components/layout/section";
import { TextLink } from "@/components/ui/text-link";
import { LABEL } from "@/constants/page";
import { flagshipHome } from "@/content/home-visual";
import { about } from "@/content/site";
import { timeline } from "@/content/timeline";
import { SITE } from "@/config/site";
import profile from "@/content/profile.json";

/** Employment shares its source with About; personal projects appear above. */
export function EngineerStrip() {
  const e = flagshipHome.engineer;
  const experience = timeline.filter((phase) => phase.org);

  return (
    <Section space="sm" ariaLabelledBy="engineer-title" className="!pb-[var(--space-section-sm)]">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <div>
          <p className={LABEL}>{e.eyebrow}</p>
          <h2
            id="engineer-title"
            className="mt-3 max-w-[20ch] text-balance text-section font-[550] text-ink"
          >
            {e.title}
          </h2>

          <div className="mt-6 flex items-center gap-4">
            <Image
              src={profile.headshot}
              alt={`Portrait of ${SITE.name}`}
              width={80}
              height={80}
              sizes="80px"
              className="h-20 w-20 shrink-0 rounded-[var(--radius-md)] object-cover"
            />
            <div className="min-w-0">
              <p className="text-base font-medium text-ink">{SITE.name}</p>
              <p className="mt-1 text-sm text-ink-secondary">{SITE.role}</p>
              <p className="mt-1 font-mono text-xs text-ink-tertiary">{profile.location}</p>
            </div>
          </div>
          <p className="mt-5 max-w-[52ch] text-sm leading-relaxed text-ink-secondary">
            {about.body[0]}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
            <TextLink href={e.ctas.about.href}>{e.ctas.about.label}</TextLink>
            <TextLink href={e.ctas.resume.href} tone="quiet">
              {e.ctas.resume.label}
            </TextLink>
          </div>
        </div>

        <div>
          <h3 className={LABEL}>{e.timelineLabel}</h3>
          <ol className="mt-5 border-t border-border">
            {experience.map((phase) => (
              <li key={phase.period} className="border-b border-border py-6">
                <p className="font-mono text-xs text-ink-tertiary">{phase.period}</p>
                <h4 className="mt-2 text-lg font-medium leading-snug text-ink">
                  {phase.role}
                </h4>
                <p className="mt-1 text-sm text-ink">{phase.org}</p>
                <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-ink-secondary">
                  {phase.built}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
