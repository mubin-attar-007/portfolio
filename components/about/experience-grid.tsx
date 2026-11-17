import { Building2, Code, GraduationCap } from "lucide-react";
import { resume } from "@/content/resume";
import { aboutPage } from "@/content/pages/about";
import styles from "./about.module.css";

const ICON_SIZE = 18;

/**
 * "Where I've worked": a four-cell grid under a cyan hairline — the heading
 * cell, each role from content/resume.ts, then the degree.
 * A11y: an h2 labels the section; each cell is titled by an h3.
 */
export function ExperienceGrid() {
  const { title, body, summaries } = aboutPage.experience;
  const { education } = resume;
  const [year, grade] = education.year.split(" · ");
  return (
    <section className={styles.xgrid} aria-labelledby="experience-title">
      <div className={styles.xcell}>
        <h2 id="experience-title">{title}</h2>
        <p>{body}</p>
      </div>
      {resume.experience.map((job, i) => {
        const Icon = i === 0 ? Building2 : Code;
        return (
          <div key={job.org} className={styles.xcell}>
            <span className={styles.tile} aria-hidden="true">
              <Icon size={ICON_SIZE} strokeWidth={1.6} />
            </span>
            <h3>{job.role}</h3>
            <p className={styles.org}>{job.org}</p>
            <p>{summaries[job.org] ?? job.points[0]}</p>
            <p className={styles.when}>
              {job.period} · {job.place}
            </p>
          </div>
        );
      })}
      <div className={styles.xcell}>
        <span className={styles.tile} aria-hidden="true">
          <GraduationCap size={ICON_SIZE} strokeWidth={1.6} />
        </span>
        <h3>{education.degree}</h3>
        <p className={styles.org}>{education.school}</p>
        {grade ? <p>{grade}.</p> : null}
        <p className={styles.when}>{year}</p>
      </div>
    </section>
  );
}
