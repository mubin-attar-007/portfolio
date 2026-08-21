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
 * Three equal tiles, one schema — the reference's own B2B pattern. A tall lead
 * tile was built and removed twice: every capture in the repo is 16:9, and a
 * portrait window can only slice it or pad it.
 */
export function SelectedWork() {
  const w = flagshipHome.work;
  const labels = { caseStudy: w.caseStudy, live: w.live, source: w.source };

  return (
    <Section space="lg" ariaLabelledBy="work-title">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <EyebrowChip>{w.eyebrow}</EyebrowChip>
          <h2
            id="work-title"
            className="mt-4 max-w-[20ch] text-balance text-section font-bold text-ink"
          >
            {w.title}
          </h2>
        </div>
        <p className="max-w-[42ch] text-pretty text-base text-ink-secondary md:pb-1">
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
        {secondaryProjects.map((project, i) => (
          <ProjectCard key={project.slug} project={project} priority={i === 0} labels={labels} />
        ))}
      </div>

      <TextLink href={w.cta.href} className="mt-10">
        {w.cta.label}
      </TextLink>
    </Section>
  );
}
