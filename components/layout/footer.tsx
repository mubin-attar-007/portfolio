import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "./container";
import { SITE, STATUS, FOOTER } from "@/config/site";
import { FOOTER_NAV } from "@/config/nav";

/**
 * Footer — a personal sign-off, then the complete site map. Clerk's footer
 * *craft* (generous space, hairline rules, mono microcopy) adapted to a personal
 * brand: a serif sign-off to the reader who scrolled the evidence, one clear way
 * to reach me, then a grouped map (Explore · Me · Elsewhere) so no route is
 * orphaned, and a colophon. Not a "Resources / Legal" company matrix — small,
 * quiet, one engineer signing the page. A11y: <footer> landmark; each nav group
 * is a labelled landmark; every link is keyboard-operable with a visible focus
 * ring; the status dot is decorative.
 */
type FLink = { label: string; href: string };

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

        {/* The complete site map, grouped so nothing is orphaned (Explore · Me · Elsewhere) */}
        <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-border pt-10 sm:grid-cols-3">
          {FOOTER_NAV.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <h2 className="font-mono text-xs uppercase tracking-[0.06em] text-ink-tertiary">
                {group.heading}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {group.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-ink-secondary transition-colors hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div>
            <h2 className="font-mono text-xs uppercase tracking-[0.06em] text-ink-tertiary">
              Elsewhere
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {PROFILES.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-ink-secondary transition-colors hover:text-ink"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
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
