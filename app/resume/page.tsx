import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { buttonVariants } from "@/components/ui/button";
import { SITE } from "@/config/site";
import { resume } from "@/content/resume";

export const metadata: Metadata = {
  title: "Résumé",
  description: "Mubin Attar — AI/ML Engineer. Experience, skills, and education.",
  alternates: { canonical: `${SITE.url}/resume` },
};

export default function ResumePage() {
  return (
    <Section space="lg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase text-ink-tertiary">Résumé</p>
          <h1 className="mt-6 text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">{SITE.name}</h1>
          <p className="mt-2 font-mono text-sm text-ink-secondary">
            {SITE.role} · {SITE.location}
          </p>
        </div>
        <a href={resume.pdf} className={buttonVariants("secondary", "sm")}>
          Download PDF
        </a>
      </div>

      <p className="mt-8 max-w-[var(--width-prose)] text-lg text-ink-secondary">{resume.summary}</p>

      <div className="reveal mt-14 grid gap-12 lg:grid-cols-[1fr_20rem]">
        <div>
          <h2 className="text-sm font-mono uppercase tracking-wide text-ink-tertiary">Experience</h2>
          <div className="mt-6 flex flex-col gap-8">
            {resume.experience.map((e) => (
              <div key={e.org}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg text-ink">
                    {e.role} <span className="text-ink-secondary">· {e.org}</span>
                  </h3>
                  <span className="font-mono text-xs text-ink-tertiary">
                    {e.place} · {e.period}
                  </span>
                </div>
                <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-ink-tertiary">
                  {e.points.map((pt, i) => (
                    <li key={i} className="max-w-[var(--width-prose)] leading-[1.7] text-ink-secondary">
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h2 className="mt-12 font-mono text-sm uppercase tracking-wide text-ink-tertiary">
            Featured projects <span className="text-ink-tertiary">— all live &amp; open-source</span>
          </h2>
          <div className="mt-6 flex flex-col gap-6">
            {resume.projects.map((p) => (
              <div key={p.name}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h3 className="text-lg text-ink">{p.name}</h3>
                  <span className="font-mono text-xs text-ink-tertiary">
                    <a
                      href={p.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:text-accent-hover"
                    >
                      live
                    </a>{" "}
                    ·{" "}
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:text-accent-hover"
                    >
                      github
                    </a>
                  </span>
                </div>
                <p className="mt-1 max-w-[var(--width-prose)] text-sm leading-[1.65] text-ink-secondary">
                  {p.tagline}
                </p>
                <p className="mt-1.5 font-mono text-xs tabular-nums text-ink-secondary">
                  {p.metric} <span className="text-ink-tertiary">· {p.stack}</span>
                </p>
              </div>
            ))}
          </div>

          <h2 className="mt-12 font-mono text-sm uppercase tracking-wide text-ink-tertiary">Education</h2>
          <div className="mt-4">
            <p className="text-ink">{resume.education.degree}</p>
            <p className="text-ink-secondary">{resume.education.school}</p>
            <p className="font-mono text-xs text-ink-tertiary">{resume.education.year}</p>
          </div>
        </div>

        <aside>
          <h2 className="font-mono text-sm uppercase tracking-wide text-ink-tertiary">Skills</h2>
          <dl className="mt-6 flex flex-col gap-4">
            {resume.skills.map((s) => (
              <div key={s.group}>
                <dt className="text-sm text-ink">{s.group}</dt>
                <dd className="mt-0.5 font-mono text-xs leading-relaxed text-ink-secondary">{s.items}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </Section>
  );
}
