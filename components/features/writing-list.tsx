"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/format";
import { ARTICLE_KICKER, ARTICLE_META } from "@/content/article";

/**
 * WritingList — a quiet, filterable editorial archive.
 * Server passes the (serializable) post metadata; filtering/grouping is client
 * side.
 *
 * Props:
 * - `posts` — serializable post metadata, newest first.
 *
 * The archive is deliberately a divided list rather than a grid of decorative
 * pseudo-documents. The writing itself carries the identity; short pieces say
 * so in their format label and every row exposes its estimated reading time.
 *
 * A11y: filters are real toggle buttons (aria-pressed); each post is one link
 * and one tab stop. The active filter is conveyed by text decoration as well as
 * colour.
 */
type Post = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  category: "essay" | "guide" | "note";
  topics: string[];
  readingMinutes: number;
};

export function WritingList({ posts }: { posts: Post[] }) {
  const topics = useMemo(
    () => Array.from(new Set(posts.flatMap((p) => p.topics))).sort((a, b) => a.localeCompare(b)),
    [posts],
  );
  const [active, setActive] = useState<string | null>(null);

  const filtered = active ? posts.filter((p) => p.topics.includes(active)) : posts;
  const byYear = useMemo(() => {
    const m = new Map<string, Post[]>();
    for (const p of filtered) {
      const y = p.date.slice(0, 4);
      (m.get(y) ?? m.set(y, []).get(y)!).push(p);
    }
    return Array.from(m.entries()); // filtered is already newest-first
  }, [filtered]);

  return (
    <div>
      <div
        className="flex flex-wrap items-center gap-x-5 gap-y-2"
        role="group"
        aria-label="Filter writing by topic"
      >
        <span className="font-mono text-xs text-ink-tertiary">Filter</span>
        <Filter on={active === null} onClick={() => setActive(null)}>
          All
        </Filter>
        {topics.map((t) => (
          <Filter key={t} on={active === t} onClick={() => setActive(active === t ? null : t)}>
            {t}
          </Filter>
        ))}
      </div>

      <div className="mt-12 flex flex-col gap-12">
        {byYear.map(([year, ps]) => (
          <section key={year}>
            <h2 className="font-mono text-xs uppercase tracking-[0.06em] text-ink-tertiary">
              {year}
            </h2>
            <ul className="mt-5 divide-y divide-border border-y border-border">
              {ps.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/writing/${p.slug}`}
                    prefetch={false}
                    // The global :focus-visible ring, pushed out so it clears a full-width row
                    // rather than tracing its text. One indicator, one look, everywhere.
                    className="group grid gap-4 py-7 focus-visible:outline-offset-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-10"
                  >
                    <span>
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-ink-tertiary">
                        <span>{ARTICLE_KICKER.writing(p.category, p.readingMinutes)}</span>
                        {p.readingMinutes > 0 ? (
                          <span>{ARTICLE_META.readingTime(p.readingMinutes)}</span>
                        ) : null}
                      </span>
                      <span className="mt-2 block text-xl text-ink transition-colors duration-fast ease-[var(--ease-out)] group-hover:text-accent">
                        {p.title}
                      </span>
                      <span className="mt-2 block max-w-[var(--width-prose)] text-sm leading-relaxed text-ink-secondary">
                        {p.summary}
                      </span>
                    </span>
                    <span className="flex items-center justify-between gap-5 sm:flex-col sm:items-end">
                      <time dateTime={p.date} className="font-mono text-xs text-ink-tertiary">
                        {formatDate(p.date)}
                      </time>
                      <ArrowRight
                        size={16}
                        strokeWidth={1.6}
                        aria-hidden
                        className="text-ink-tertiary transition-[color,transform] duration-fast ease-[var(--ease-out)] group-hover:translate-x-0.5 group-hover:text-accent"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {filtered.length === 0 ? (
          <p className="text-ink-secondary">No posts tagged &ldquo;{active}&rdquo; yet.</p>
        ) : null}
      </div>
    </div>
  );
}

function Filter({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`min-h-6 font-mono text-xs underline-offset-4 transition-colors duration-fast ease-[var(--ease-out)] ${
        on
          ? "text-ink underline decoration-ink"
          : "text-ink-secondary hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
