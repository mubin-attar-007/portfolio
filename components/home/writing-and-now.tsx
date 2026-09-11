import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { TextLink } from "@/components/ui/text-link";
import { LABEL } from "@/constants/page";
import { flagshipHome } from "@/content/home-visual";
import { formatDate } from "@/lib/format";
import styles from "./writing-and-now.module.css";

export type WritingPreview = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  category: string;
};

export type ExploringItem = { title: string; body: string };

/** Essays and current interests are drawn from their original MDX sources. */
export function WritingAndNow({
  writing,
  exploring,
}: {
  writing: WritingPreview[];
  exploring: ExploringItem[];
}) {
  const w = flagshipHome.writing;
  const e = flagshipHome.exploring;
  const n = flagshipHome.notebook;

  return (
    <Section
      space="sm"
      tone="subtle"
      ariaLabelledBy="writing-title"
      className="!pb-[var(--space-section-sm)]"
    >
      <div className="mb-8">
        <p className={LABEL}>{n.eyebrow}</p>
        <h2 id="writing-title" className="mt-3 text-balance text-section font-[550] text-ink">
          {n.title}
        </h2>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-20">
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h3 className={LABEL}>{w.label}</h3>
            <TextLink href={w.cta.href}>{w.cta.label}</TextLink>
          </div>

          <ul className="mt-3 border-t border-border-strong">
            {writing.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/writing/${post.slug}`}
                  prefetch={false}
                  className={styles.postLink}
                >
                  <span className="min-w-0 flex-1">
                    <span className={`${styles.postTitle} block text-lg font-medium leading-snug`}>
                      {post.title}
                    </span>
                    <span className="mt-2 block max-w-[57ch] text-sm leading-relaxed text-ink-secondary">
                      {post.summary}
                    </span>
                    <span className="mt-2 block font-mono text-xs text-ink-tertiary">
                      {post.category} · <time dateTime={post.date}>{formatDate(post.date)}</time>
                    </span>
                  </span>
                  <ArrowUpRight
                    size={16}
                    strokeWidth={1.5}
                    aria-hidden
                    className={styles.postArrow}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h3 className={LABEL}>{e.label}</h3>
            <TextLink href={e.cta.href}>{e.cta.label}</TextLink>
          </div>

          <ul className="mt-3 border-t border-border-strong">
            {exploring.map((item) => (
              <li key={item.title} className="border-b border-border-strong py-5">
                <h4 className="text-base font-medium leading-snug text-ink">{item.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
