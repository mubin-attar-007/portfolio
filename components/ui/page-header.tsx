import type { ReactNode } from "react";

/**
 * PageHeader — the top of a case study / section page: an xs mono meta line
 * (status · role · timeline), the title, and a lede. A11y: single <h1> per page.
 */
export function PageHeader({
  meta,
  title,
  lede,
  children,
}: {
  meta?: string;
  title: string;
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4">
      {meta ? <p className="font-mono text-xs uppercase text-ink-tertiary">{meta}</p> : null}
      <h1 className="max-w-[20ch] text-4xl text-ink sm:text-5xl">{title}</h1>
      {lede ? <p className="max-w-[var(--width-prose)] text-lg text-ink-secondary">{lede}</p> : null}
      {children}
    </header>
  );
}
