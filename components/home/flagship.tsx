import Link from "next/link";
import { ArrowRight, ArrowUpRight, GitBranch, X } from "lucide-react";
import { Section } from "@/components/layout/section";
import { buttonVariants } from "@/components/ui/button";
import { EyebrowChip } from "@/components/ui/eyebrow-chip";
import { flagshipHome } from "@/content/home-visual";
import { featuredProject } from "@/content/projects";
import styles from "./flagship.module.css";

/** The stages that carry the accent — the three that are the actual argument. */
const KEY_STAGES = new Set(["retrieve", "validate", "execute"]);

/**
 * FlagshipProject — DBWhisper, given the page's strongest treatment after the
 * hero, on the first of exactly two dark bands.
 *
 * Structure is deliberately asymmetric: a narrow copy rail (what it is, the
 * problem, three guarantees, the actions) against a wider system diagram. Equal
 * columns would read as two things facing each other; this reads as an
 * explanation of the thing beside it.
 *
 * The title, summary and links come from `content/projects.ts` — the same source
 * the /work index and the case study read — so the flagship cannot describe
 * itself differently in three places.
 *
 * The diagram renders the refusal branch, not just the happy path. That is the
 * whole product argument in one glyph: a pipeline that only ever draws success
 * is describing a demo.
 *
 * A11y: the pipeline is an ordered list in DOM order, so it reads as a sequence
 * without the diagram; the connector rules and node glyphs are decorative CSS.
 * The refusal is carried by a dashed border, a cross icon AND the word "Refuse".
 */
export function FlagshipProject() {
  const f = flagshipHome.flagship;

  return (
    <Section tone="invert" space="lg" ariaLabelledBy="flagship-title" className="overflow-hidden">
      {/* Depth, not decoration: a gradient hairline where the light page meets
          the plate, the sparse grid the motif is drawn on, and one violet
          radial behind the diagram. All decorative, all far below any text. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent_8%,color-mix(in_srgb,var(--color-accent)_65%,transparent)_50%,transparent_92%)]"
      />
      <div aria-hidden className="grid-field" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/4 h-[30rem] w-[38rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-accent)_22%,transparent),transparent)]"
      />
      <div className={styles.layout}>
        <div>
          <EyebrowChip>{f.eyebrow}</EyebrowChip>
          <h2 id="flagship-title" className={styles.title}>
            {featuredProject.title}
          </h2>
          <p className={styles.definition}>{f.definition}</p>
          <p className={styles.problem}>{f.problem}</p>

          <p className={styles.guaranteeLabel}>{f.guaranteesLabel}</p>
          <ol className={styles.guarantees}>
            {f.guarantees.map((g) => (
              <li key={g.n} className={styles.guarantee}>
                <span className={styles.guaranteeN} aria-hidden>
                  {g.n}
                </span>
                <h3 className={styles.guaranteeTitle}>{g.title}</h3>
                <p className={styles.guaranteeBody}>{g.body}</p>
              </li>
            ))}
          </ol>

          <div className={styles.actions}>
            <Link
              href={`/work/${featuredProject.slug}`}
              prefetch={false}
              className={buttonVariants("primary", "md")}
            >
              {f.caseStudy}
              <ArrowRight size={15} strokeWidth={2.25} aria-hidden />
            </Link>
            {featuredProject.links.live ? (
              <a
                href={featuredProject.links.live}
                target="_blank"
                rel="noopener noreferrer"
                className="group/live inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary transition-colors duration-fast ease-[var(--ease-out)] hover:text-ink"
              >
                {f.live}
                <ArrowUpRight
                  size={14}
                  strokeWidth={2.25}
                  aria-hidden
                  className="transition-transform duration-fast ease-[var(--ease-out)] group-hover/live:-translate-y-0.5 group-hover/live:translate-x-0.5"
                />
              </a>
            ) : null}
            {featuredProject.links.repo ? (
              <a
                href={featuredProject.links.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="group/repo inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary transition-colors duration-fast ease-[var(--ease-out)] hover:text-ink"
              >
                {f.repo}
                <ArrowUpRight
                  size={14}
                  strokeWidth={2.25}
                  aria-hidden
                  className="transition-transform duration-fast ease-[var(--ease-out)] group-hover/repo:-translate-y-0.5 group-hover/repo:translate-x-0.5"
                />
              </a>
            ) : null}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <GitBranch className={styles.panelMark} strokeWidth={2} aria-hidden />
            <p className={styles.panelTitle}>Request path</p>
          </div>
          <ol className={styles.flow}>
            {f.pipeline.map((stage, i) => (
              <li key={stage.id} className={styles.stage}>
                <span
                  className={`${styles.node} ${KEY_STAGES.has(stage.id) ? styles.nodeKey : ""}`}
                  aria-hidden
                >
                  {i + 1}
                </span>
                <span className={styles.stageLabel}>{stage.label}</span>
                <span className={styles.stageNote}>{stage.note}</span>

                {stage.id === "validate" ? (
                  <span className={styles.branch}>
                    <X className={styles.branchMark} strokeWidth={2.5} aria-hidden />
                    <span className={styles.branchLabel}>{f.refusal.label}</span>
                    <span className={styles.branchNote}>{f.refusal.note}</span>
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
