import { SITE } from "@/config/site";

/**
 * Footer — quiet colophon: what the site is built with, a source link, and a
 * machine-readable pointer (llms.txt, generated in Sprint 6). One line, muted.
 * A11y: <footer> landmark; links have discernible names.
 */
export function Footer({ year }: { year: number }) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-[var(--width-container)] flex-col gap-2 px-6 py-8 text-xs text-ink-tertiary md:flex-row md:items-center md:justify-between md:px-8">
        <span className="font-mono">
          © {year} {SITE.name} · Built with Next.js, TypeScript &amp; Tailwind
        </span>
        <span className="flex items-center gap-4 font-mono">
          <a href={SITE.socials.github} className="hover:text-ink" rel="noopener noreferrer" target="_blank">
            Source
          </a>
          <a href="/llms.txt" className="hover:text-ink">
            llms.txt
          </a>
        </span>
      </div>
    </footer>
  );
}
