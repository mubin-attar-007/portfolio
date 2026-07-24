import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SITE, STATUS } from "@/config/site";
import { flagshipHome } from "@/content/home-visual";
import { home } from "@/content/site";
import { featuredProject, secondaryProjects } from "@/content/projects";
import { formatDate } from "@/lib/format";
import styles from "./flagship-home.module.css";

type WritingPreview = {
  slug: string;
  title: string;
  date: string;
};

type FlagshipHomeProps = {
  writing: WritingPreview[];
};

function SectionIntro({
  id,
  kicker,
  title,
  body,
  invert = false,
}: {
  id: string;
  kicker: string;
  title: string;
  body: string;
  invert?: boolean;
}) {
  return (
    <div className={styles.sectionIntro}>
      <p className={styles.kicker}>{kicker}</p>
      <h2 id={id} className={invert ? styles.invertHeading : undefined}>
        {title}
      </h2>
      <p>{body}</p>
    </div>
  );
}

export function FlagshipHome({ writing }: FlagshipHomeProps) {
  return (
    <>
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={`${styles.container} ${styles.heroLayout}`}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>{flagshipHome.hero.kicker}</p>
            <h1 id="home-title">{flagshipHome.hero.title}</h1>
            <p className={styles.heroBody}>{flagshipHome.hero.body}</p>
            <div className={styles.heroActions}>
              <Link
                href={`/work/${featuredProject.slug}`}
                prefetch={false}
                className={buttonVariants("primary", "md")}
              >
                {flagshipHome.hero.primary}
              </Link>
              <Link href="#principles" prefetch={false} className={styles.textCta}>
                {flagshipHome.hero.secondary}
                <ArrowRight aria-hidden size={15} />
              </Link>
            </div>
            <p className={styles.availability}>{STATUS.text}</p>
          </div>
        </div>
      </section>

      <section className={styles.proofRail} aria-label="Experience and evidence">
        <div className={`${styles.container} ${styles.proofGrid}`}>
          <p className={styles.proofLead}>{flagshipHome.proof.lead}</p>
          {flagshipHome.proof.items.map((item) => (
            <Link
              className={styles.proofMetric}
              href={item.href}
              prefetch={false}
              key={item.label}
            >
              <strong>{item.value}</strong>
              <span>{item.label}</span>
              <small>{item.method}</small>
            </Link>
          ))}
        </div>
      </section>

      <section
        className={styles.flagshipSection}
        aria-labelledby="flagship-title"
      >
        <div className={`${styles.container} ${styles.flagshipLayout}`}>
          <div className={styles.flagshipCopy}>
            <p className={styles.kicker}>Flagship case study</p>
            <h2 id="flagship-title">{featuredProject.title}</h2>
            <p>{featuredProject.summary}</p>
            <dl className={styles.metricList}>
              {featuredProject.metrics.slice(0, 3).map((metric) => (
                <div key={metric.label}>
                  <dt>{metric.label}</dt>
                  <dd>
                    <span>{metric.value}</span>
                    <Link
                      href={`/work/${featuredProject.slug}#performance-cost`}
                      prefetch={false}
                    >
                      {metric.method}
                    </Link>
                  </dd>
                </div>
              ))}
            </dl>
            <div className={styles.inlineActions}>
              <Link
                href={`/work/${featuredProject.slug}`}
                prefetch={false}
                className={styles.textCta}
              >
                Read the case study
                <ArrowRight aria-hidden size={15} />
              </Link>
              <a
                href={featuredProject.links.live}
                target="_blank"
                rel="noreferrer"
                className={styles.textCta}
              >
                Open live product
                <ArrowUpRight aria-hidden size={15} />
              </a>
            </div>
          </div>

          <figure className={styles.systemFigure}>
            <figcaption>
              <span className={styles.microLabel}>Controlled execution path</span>
              <strong>Natural language in. Inspected result out.</strong>
            </figcaption>
            <ol>
              {[
                ["01", "Retrieve schema", "Only relevant tables enter context."],
                ["02", "Generate candidate", "The model proposes Postgres SQL."],
                ["03", "Validate boundary", "Read-only and enrolled-table rules gate it."],
                ["04", "Execute safely", "A constrained connection runs accepted SQL."],
                ["05", "Measure behavior", "Golden queries score the deployed path."],
              ].map(([n, title, detail]) => (
                <li key={n}>
                  <span>{n}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </figure>
        </div>
      </section>

      <section className={styles.systemsSection} aria-labelledby="systems-title">
        <div className={styles.container}>
          <SectionIntro
            id="systems-title"
            kicker={flagshipHome.products.kicker}
            title={flagshipHome.products.title}
            body={flagshipHome.products.body}
          />
          <div className={styles.systemRows}>
            {secondaryProjects.map((project, index) => (
              <article key={project.slug}>
                <span className={styles.rowIndex}>
                  {String(index + 2).padStart(2, "0")}
                </span>
                <div className={styles.rowCopy}>
                  <p className={styles.rowMeta}>
                    {project.status} · {project.timeline}
                  </p>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                </div>
                <div className={styles.rowEvidence}>
                  <strong>{project.metrics[0]?.value}</strong>
                  <span>{project.metrics[0]?.label}</span>
                  <Link
                    href={`/work/${project.slug}#performance-cost`}
                    prefetch={false}
                  >
                    {project.metrics[0]?.method}
                  </Link>
                </div>
                <div className={styles.rowLinks}>
                  <Link href={`/work/${project.slug}`} prefetch={false}>
                    Case study
                  </Link>
                  <a href={project.links.live} target="_blank" rel="noreferrer">
                    Live product
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="principles"
        className={`${styles.principlesSection} tone-invert tone-notch`}
        aria-labelledby="principles-title"
      >
        <div className={styles.container}>
          <SectionIntro
            id="principles-title"
            kicker={flagshipHome.operatingSystem.kicker}
            title={flagshipHome.operatingSystem.title}
            body={flagshipHome.operatingSystem.body}
            invert
          />
          <ol className={styles.principleList}>
            {flagshipHome.operatingSystem.steps.map((step) => (
              <li key={step.n}>
                <span>{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
          <div className={styles.principleClose}>
            <p>&ldquo;{flagshipHome.close.principle}&rdquo;</p>
            <Link href="/evals" prefetch={false} className={styles.textCta}>
              Open the evaluation registry
              <ArrowRight aria-hidden size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.writingSection} aria-labelledby="writing-title">
        <div className={styles.container}>
          <div className={styles.writingHeader}>
            <SectionIntro
              id="writing-title"
              kicker={flagshipHome.writing.kicker}
              title={flagshipHome.writing.title}
              body={flagshipHome.writing.body}
            />
            <Link href="/writing" prefetch={false} className={styles.textCta}>
              {flagshipHome.writing.cta}
              <ArrowRight aria-hidden size={15} />
            </Link>
          </div>
          <div className={styles.writingList}>
            {writing.map((post, index) => (
              <Link
                href={`/writing/${post.slug}`}
                prefetch={false}
                key={post.slug}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{post.title}</h3>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <ArrowUpRight aria-hidden size={17} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.nowSection} aria-labelledby="now-title">
        <div className={`${styles.container} ${styles.nowLayout}`}>
          <div>
            <p className={styles.kicker}>{home.now.kicker}</p>
            <h2 id="now-title">{home.now.title}</h2>
          </div>
          <div>
            <p>{home.now.teaser}</p>
            <Link href={home.now.href} prefetch={false} className={styles.textCta}>
              {home.now.cta}
              <ArrowRight aria-hidden size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section
        className={`${styles.closeSection} tone-invert tone-notch-b`}
        aria-labelledby="contact-title"
      >
        <div className={styles.container}>
          <div className={styles.closeCopy}>
            <p className={styles.kicker}>{flagshipHome.close.kicker}</p>
            <h2 id="contact-title">{flagshipHome.close.title}</h2>
            <p>{flagshipHome.close.body}</p>
            <div className={styles.closeActions}>
              <Link
                href={STATUS.href}
                prefetch={false}
                className={buttonVariants("primary", "md")}
              >
                {flagshipHome.close.primary}
              </Link>
              <Link href="/resume" prefetch={false} className={styles.textCta}>
                {flagshipHome.close.secondary}
              </Link>
            </div>
            <a className={styles.emailLink} href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
