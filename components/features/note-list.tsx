"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/format";

/**
 * NoteList — the digital-garden index: tag-filter chips + compact rows grouped
 * by month (date · title · tags), not full cards. Server passes serializable
 * note metadata; filtering/grouping is client-side. A11y: chips are real toggle
 * buttons (aria-pressed); each note is one link; the month is a heading
 * labelling its list.
 */
type Note = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
};

export function NoteList({ notes }: { notes: Note[] }) {
  const tags = useMemo(
    () => Array.from(new Set(notes.flatMap((n) => n.tags))).sort((a, b) => a.localeCompare(b)),
    [notes],
  );
  const [active, setActive] = useState<string | null>(null);

  const filtered = active ? notes.filter((n) => n.tags.includes(active)) : notes;
  const byMonth = useMemo(() => {
    const m = new Map<string, Note[]>();
    for (const n of filtered) {
      const key = n.date.slice(0, 7); // YYYY-MM
      (m.get(key) ?? m.set(key, []).get(key)!).push(n);
    }
    return Array.from(m.entries()); // filtered is already newest-first
  }, [filtered]);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter notes by tag">
        <Chip on={active === null} onClick={() => setActive(null)}>
          All
        </Chip>
        {tags.map((t) => (
          <Chip key={t} on={active === t} onClick={() => setActive(active === t ? null : t)}>
            {t}
          </Chip>
        ))}
      </div>

      <div className="mt-12 flex flex-col gap-10">
        {byMonth.map(([key, ns]) => (
          <section key={key}>
            <h2 className="font-mono text-xs uppercase tracking-[0.06em] text-ink-tertiary">
              {formatDate(`${key}-01`)}
            </h2>
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {ns.map((n) => (
                <li key={n.slug}>
                  <Link
                    href={`/notes/${n.slug}`}
                    className="group -mx-4 flex flex-col gap-2 rounded-[var(--radius-md)] px-4 py-4 transition-colors duration-200 ease-[var(--ease-out)] hover:bg-bg-subtle sm:flex-row sm:items-baseline sm:gap-5"
                  >
                    <time
                      dateTime={n.date}
                      className="shrink-0 font-mono text-xs text-ink-tertiary sm:w-24"
                    >
                      {formatDate(n.date)}
                    </time>
                    <span className="flex-1 text-ink transition-colors group-hover:text-accent">
                      {n.title}
                    </span>
                    <span className="flex flex-wrap gap-x-2 gap-y-1">
                      {n.tags.map((t) => (
                        <span key={t} className="font-mono text-xs text-ink-tertiary">
                          #{t}
                        </span>
                      ))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {filtered.length === 0 ? (
          <p className="text-ink-secondary">No notes tagged &ldquo;{active}&rdquo; yet.</p>
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
