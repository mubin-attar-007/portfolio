import { Section } from "@/components/layout/section";
import { TextLink } from "@/components/ui/text-link";
import { ProjectCard } from "@/components/work/project-card";
import { EyebrowChip } from "@/components/ui/eyebrow-chip";
import { flagshipHome } from "@/content/home-visual";
import { secondaryProjects } from "@/content/projects";
import styles from "@/components/work/project-card.module.css";

/**
 * SelectedWork — the three non-flagship products as an editorial bento.
 *
 * DBWhisper is deliberately absent: it has the flagship band directly above, and
 * adding it as a fourth equal card would flatten the hierarchy that band exists
 * to create. The closing link goes to /work, where all four are listed together
 * — using the same `ProjectCard`, so the click does not land the visitor on what
 * looks like a different site.
 *
 * The shapes differ on purpose. The lead project takes a tall card with a large
 * screenshot; the other two stack beside it. Three identical tiles would say
 * "these are interchangeable"; this says "start here".
 */
export function SelectedWork() {
  const w = flagshipHome.work;
  const labels = { caseStudy: w.caseStudy, live: w.live, source: w.source };
  const [lead, ...rest] = secondaryProjects;

  return (
    <Section space="lg" ariaLabelledBy="work-title">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <EyebrowChip>{w.eyebrow}</EyebrowChip>
          <h2
            id="work-title"
            className="mt-4 max-w-[20ch] text-balance text-section font-[560] text-ink"
          >
            {w.title}
          </h2>
        </div>
        <p className="max-w-[42ch] text-pretty text-base text-ink-secondary md:pb-1">
          {w.body}
        </p>
      </div>

      <div className={styles.grid}>
        {lead ? <ProjectCard project={lead} size="lead" labels={labels} /> : null}
        {rest.map((project) => (
          <ProjectCard key={project.slug} project={project} labels={labels} />
        ))}
      </div>

      <TextLink href={w.cta.href} className="mt-10">
        {w.cta.label}
      </TextLink>
    </Section>
  );
}
