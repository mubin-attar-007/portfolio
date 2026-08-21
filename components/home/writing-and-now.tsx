import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { TextLink } from "@/components/ui/text-link";
import { LABEL } from "@/constants/page";
import { EyebrowChip } from "@/components/ui/eyebrow-chip";
import { flagshipHome } from "@/content/home-visual";
import { formatDate } from "@/lib/format";

export type WritingPreview = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  category: string;
};

export type ExploringItem = { title: string; body: string };

/**
 * WritingAndNow — one editorial band carrying two things that used to be two
 * full-width sections with their own headers and their own bento grids.
 *
 * Merging them is the point. Neither "here are three posts" nor "here is what
 * I'm reading" earns a section of its own on a homepage whose job is to make a
 * hiring manager open a case study; together they earn one, as the human beat
 * between the engineering sections and the close.
 *
 * The layout is asymmetric — writing takes the wider column because a title plus
 * a summary needs a measure, while a current-focus line does not.
 *
 * `exploring` comes from the front-matter of content/now.mdx, the same source
 * /now renders. It is structured data rather than a markdown list precisely so
 * this section can show it without restating it: a list that lives in prose can
 * only ever be duplicated.
 *
 * A11y: two labelled regions, each with a real `<h2>`; the writing rows are
 * single links whose accessible name is the post title, with the metadata line
 * inside the link so it is announced as part of the row rather than orphaned.
 */
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
    <Section space="lg" ariaLabelledBy="writing-title">
      {/* The section claims its place in the page's H2 cadence — without this
          headline it read as footer matter despite holding three essays. */}
      <div className="mb-12">
        <EyebrowChip>{n.eyebrow}</EyebrowChip>
        <h2 id="writing-title" className="mt-4 text-balance text-section font-bold text-ink">
          {n.title}
        </h2>
      </div>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-20">
        {/* ---- selected writing ---- */}
        <div>
          <div className="flex items-baseline justify-between gap-6">
            <h3 className={LABEL}>{w.label}</h3>
            <TextLink href={w.cta.href}>{w.cta.label}</TextLink>
          </div>

          <ul className="mt-6 border-t border-border">
            {writing.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/writing/${post.slug}`}
                  prefetch={false}
                  className="group/post flex items-start gap-5 border-b border-border py-5 transition-colors duration-fast ease-[var(--ease-out)] hover:bg-bg-subtle"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[1.0625rem] font-[550] leading-snug tracking-[-0.015em] text-ink">
                      {post.title}
                    </span>
                    <span className="mt-1.5 block max-w-[54ch] text-sm leading-relaxed text-ink-secondary">
                      {post.summary}
                    </span>
                    <span className="mt-2.5 block font-mono text-xs uppercase tracking-[0.06em] text-ink-tertiary">
                      {post.category} · <time dateTime={post.date}>{formatDate(post.date)}</time>
                    </span>
                  </span>
                  <ArrowUpRight
                    size={16}
                    strokeWidth={2}
                    aria-hidden
                    className="mt-1 shrink-0 text-ink-tertiary transition-[transform,color] duration-fast ease-[var(--ease-out)] group-hover/post:-translate-y-0.5 group-hover/post:translate-x-0.5 group-hover/post:text-accent"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ---- currently exploring ---- */}
        <div>
          <div className="flex items-baseline justify-between gap-6">
            <h3 className={LABEL}>{e.label}</h3>
            <TextLink href={e.cta.href}>{e.cta.label}</TextLink>
          </div>

          <ol className="mt-6 flex flex-col gap-3">
            {exploring.map((item, i) => (
              <li
                key={item.title}
                className="rounded-[var(--radius-md)] border border-border bg-surface p-4 shadow-[var(--shadow-sm)] transition-[border-color,transform,box-shadow] duration-base ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--color-accent)_32%,var(--color-border))] hover:shadow-[var(--shadow-md)] motion-reduce:hover:translate-y-0"
              >
                <p className={LABEL}>{String(i + 1).padStart(2, "0")}</p>
                <h4 className="mt-2 text-[0.9375rem] font-[550] leading-snug text-ink">
                  {item.title}
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
