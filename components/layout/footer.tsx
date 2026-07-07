import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "./container";
import { SITE, STATUS, FOOTER } from "@/config/site";

/**
 * Footer — a personal sign-off, not a company sitemap. Clerk's footer *craft*
 * (generous space, hairline rules, mono microcopy) adapted to a personal brand:
 * a serif sign-off to the reader who scrolled the evidence, one clear way to
 * reach me, then a single quiet strip of essential nav + profiles and a
 * colophon. No column matrix, no "Resources / Legal" — one engineer signing the
 * page. A11y: <footer> landmark; the nav strip is labelled; every link is
 * keyboard-operable with a visible focus ring; the status dot is decorative.
 */
type FLink = { label: string; href: string };

const NAV: FLink[] = [
  { label: "Work", href: "/work" },
  { label: "Writing", href: "/writing" },
  { label: "About", href: "/about" },
  { label: "Timeline", href: "/timeline" },
  { label: "Résumé", href: "/resume" },
];

const PROFILES: FLink[] = [
  { label: "GitHub", href: SITE.socials.github },
  { label: "LinkedIn", href: SITE.socials.linkedin },
  { label: "Hugging Face", href: SITE.socials.huggingface },
];

export function Footer({ year }: { year: number }) {
  return (
    <footer className="border-t border-border bg-bg-subtle">
      <Container className="py-16 sm:py-20">
        {/* Sign-off — a human close + one clear invitation, in the owner's voice */}
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[42ch]">
            <Link href="/" className="font-mono text-sm font-medium tracking-tight text-ink">
              {SITE.name.toLowerCase()}
            </Link>
            <p className="mt-5 font-serif text-2xl italic leading-snug text-ink sm:text-[1.75rem]">
              {FOOTER.signoff}
            </p>
            <p className="mt-4 max-w-[34ch] text-sm text-ink-secondary">{FOOTER.invite}</p>
          </div>
          <div className="flex flex-col items-start gap-4 md:items-end">
            <a
              href={`mailto:${SITE.email}`}
              className="group inline-flex items-center gap-2 text-lg text-ink"
            >
              <span className="link-underline">{SITE.email}</span>
              <ArrowUpRight
                size={18}
                strokeWidth={1.5}
                className="text-ink-tertiary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden
              />
            </a>
            <p className="inline-flex items-center gap-2 font-mono text-xs text-ink-tertiary">
              <span className="h-1.5 w-1.5 rounded-full bg-positive" aria-hidden />
              {STATUS.text}
            </p>
          </div>
        </div>

        {/* One quiet strip: essential nav + profiles (not a company matrix) */}
        <div className="mt-14 flex flex-col gap-5 border-t border-border pt-7 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            {NAV.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-sm text-ink-secondary transition-colors hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {PROFILES.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-ink-tertiary transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>

        {/* Colophon */}
        <div className="mt-8 flex flex-col gap-3 font-mono text-xs text-ink-tertiary sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} {SITE.name} · {SITE.location}
          </span>
          <span className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span>Built with Next.js, TypeScript &amp; Tailwind</span>
            <a
              href={SITE.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink"
            >
              Source
            </a>
            <a href="/llms.txt" className="hover:text-ink">
              llms.txt
            </a>
          </span>
        </div>
      </Container>
    </footer>
  );
}
