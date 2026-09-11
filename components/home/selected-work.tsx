import { Section } from "@/components/layout/section";
import { TextLink } from "@/components/ui/text-link";
import { ProjectCard } from "@/components/work/project-card";
import { LABEL } from "@/constants/page";
import { flagshipHome } from "@/content/home-visual";
import { secondaryProjects } from "@/content/projects";
import styles from "@/components/work/project-card.module.css";

/** Three other systems, each explained through a concrete engineering decision. */
export function SelectedWork() {
  const w = flagshipHome.work;
  const labels = { caseStudy: w.caseStudy, live: w.live, source: w.source };

  return (
    <Section id="selected-work" space="sm" ariaLabelledBy="work-title" className="!pb-[var(--space-section-sm)]">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className={LABEL}>{w.eyebrow}</p>
          <h2
            id="work-title"
            className="mt-3 max-w-[25ch] text-balance text-section font-[550] text-ink"
          >
            {w.title}
          </h2>
        </div>
        <p className="max-w-[42ch] text-pretty text-sm leading-relaxed text-ink-secondary md:pb-1">
          {w.bodyParts.map((part, i) =>
            "strong" in part && part.strong ? (
              <strong key={i} className="font-medium text-ink">
                {part.t}
              </strong>
            ) : (
              <span key={i}>{part.t}</span>
            ),
          )}
        </p>
      </div>

      <div className={styles.grid}>
        {secondaryProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} labels={labels} />
        ))}
      </div>

      <TextLink href={w.cta.href} className="mt-7">
        {w.cta.label}
      </TextLink>
    </Section>
  );
}
