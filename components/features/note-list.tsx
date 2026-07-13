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

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((n) => (
          <li key={n.slug}>
            <Link
              href={`/notes/${n.slug}`}
              className="group flex h-full flex-col justify-between gap-6 rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-[var(--shadow-sm)] transition-colors hover:border-border-strong"
            >
              <span className="text-ink transition-colors group-hover:text-accent">{n.title}</span>
              <div className="flex items-center justify-between gap-3">
                <time dateTime={n.date} className="shrink-0 font-mono text-xs text-ink-tertiary">
                  {formatDate(n.date)}
                </time>
                <span className="flex flex-wrap justify-end gap-x-2 gap-y-1">
                  {n.tags.map((t) => (
                    <span key={t} className="font-mono text-xs text-ink-tertiary">
                      #{t}
                    </span>
                  ))}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {filtered.length === 0 ? (
        <p className="mt-12 text-ink-secondary">No notes tagged &ldquo;{active}&rdquo; yet.</p>
      ) : null}
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
