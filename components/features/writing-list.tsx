"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/format";

/**
 * WritingList — the active-blog index: topic-filter chips + a year archive.
 * Server passes the (serializable) post metadata; filtering/grouping is client
 * side. A11y: chips are real toggle buttons (aria-pressed); each post is one
 * link; the year is a heading labelling its list.
 */
type Post = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  category: "essay" | "guide" | "note";
  topics: string[];
};

const LABEL: Record<Post["category"], string> = { essay: "Essay", guide: "Guide", note: "Note" };

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
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter writing by topic">
        <Chip on={active === null} onClick={() => setActive(null)}>
          All
        </Chip>
        {topics.map((t) => (
          <Chip key={t} on={active === t} onClick={() => setActive(active === t ? null : t)}>
            {t}
          </Chip>
        ))}
      </div>

      <div className="mt-12 flex flex-col gap-12">
        {byYear.map(([year, ps]) => (
          <section key={year}>
            <h2 className="font-mono text-xs uppercase tracking-[0.06em] text-ink-tertiary">{year}</h2>
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {ps.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/writing/${p.slug}`}
                    className="group -mx-4 grid gap-1 rounded-[var(--radius-md)] px-4 py-6 transition-colors duration-200 ease-[var(--ease-out)] hover:bg-bg-subtle md:grid-cols-[1fr_auto] md:items-baseline md:gap-8"
                  >
                    <div>
                      <div className="flex flex-wrap items-baseline gap-3">
                        <h3 className="text-xl text-ink transition-colors group-hover:text-accent">
                          {p.title}
                        </h3>
                        <span className="font-mono text-xs uppercase text-ink-tertiary">
                          {LABEL[p.category]}
                        </span>
                      </div>
                      <p className="mt-1 max-w-[var(--width-prose)] text-sm text-ink-secondary">
                        {p.summary}
                      </p>
                    </div>
                    <time dateTime={p.date} className="font-mono text-xs text-ink-tertiary">
                      {formatDate(p.date)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {filtered.length === 0 ? (
          <p className="text-ink-secondary">
            No posts tagged &ldquo;{active}&rdquo; yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Chip({
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
      className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors duration-200 ease-[var(--ease-out)] ${
        on
          ? "border-accent bg-accent text-on-accent"
          : "border-border-strong text-ink-secondary hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
