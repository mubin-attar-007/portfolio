import Link from "next/link";
import { Container } from "./container";
import { BoundaryMark } from "@/components/ui/boundary-mark";
import { LABEL } from "@/constants/page";
import { SITE, STATUS, FOOTER } from "@/config/site";
import { FOOTER_NAV } from "@/config/nav";

/**
 * Footer — compact by design.
 *
 * This is a personal site, not a multi-product company, so it gets a personal
 * footer: an identity column (mark, name, one-line positioning, the literal
 * email, the availability line) and a short two-column link map. No sitemap, no
 * newsletter block, no decorative serif quote — every one of those is a
 * corporate-footer reflex that would make the page end louder than it started.
 *
 * The footer carries no background of its own and no top border: it is the quiet
 * end of the page surface, separated by whitespace and closed by one hairline
 * above the colophon.
 *
 * A11y: a `<footer>` landmark; each link group is its own labelled `<nav>`; the
 * status dot is decorative and the sentence beside it carries the meaning.
 */
type FLink = { label: string; href: string };

const PROFILES: FLink[] = [
  { label: "GitHub", href: SITE.socials.github },
  { label: "LinkedIn", href: SITE.socials.linkedin },
  { label: "Hugging Face", href: SITE.socials.huggingface },
];

const FOOTER_LINK =
  "text-sm text-ink-secondary transition-colors duration-fast ease-[var(--ease-out)] hover:text-ink";

export function Footer({ year }: { year: number }) {
  return (
    <footer className="border-t border-border bg-bg">
      <Container className="pb-10 pt-20 sm:pb-12 sm:pt-28">
        <div className="grid gap-y-12 md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-16">
          {/* Identity — the personal replacement for a product's logo column. */}
          <div className="max-w-[38ch]">
            <Link
              href="/"
              prefetch={false}
              className="inline-flex items-center gap-2 text-[0.9375rem] font-semibold tracking-[-0.017em] text-ink"
            >
              <BoundaryMark size={18} className="text-accent" />
              {SITE.name}
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
              {FOOTER.positioning}
            </p>
            <p className="mt-5">
              <a
                href={`mailto:${SITE.email}`}
                className="text-sm font-medium text-ink"
              >
                <span className="link-underline">{SITE.email}</span>
              </a>
              <span className="ml-2 text-sm text-ink-tertiary">{FOOTER.invite}</span>
            </p>
            <p className="mt-5 inline-flex items-start gap-2 font-mono text-xs leading-relaxed text-ink-tertiary">
              <span
                aria-hidden
                className="mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-[var(--radius-pill)] bg-positive"
              />
              {STATUS.text}
            </p>
          </div>

          {/* A shortlist, not a second sitemap. Reference routes stay reachable
              from the pages that need them. */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-10 sm:grid-cols-4 md:gap-x-12">
            {FOOTER_NAV.map((group) => (
              <nav key={group.heading} aria-label={group.heading}>
                <h2 className={LABEL}>{group.heading}</h2>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {group.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} prefetch={false} className={FOOTER_LINK}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <nav aria-label="Elsewhere">
              <h2 className={LABEL}>Elsewhere</h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {PROFILES.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={FOOTER_LINK}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Colophon — one hairline, then a single bottom bar. The rule is
            `.rule-fade` (it dies before the gutter) rather than a border, so the
            bar closes the page without boxing it in. */}
        <hr className="rule-fade mt-12" />
        <div className="mt-6 flex flex-col gap-3 font-mono text-xs text-ink-tertiary sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} {SITE.name} · {SITE.location}
          </span>
          <span className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span>Built with Next.js &amp; Tailwind</span>
            <Link href="/trust" prefetch={false} className="transition-colors hover:text-ink">
              Trust
            </Link>
            <Link href="/privacy" prefetch={false} className="transition-colors hover:text-ink">
              Privacy
            </Link>
            <a href="/llms.txt" className="transition-colors hover:text-ink">
              llms.txt
            </a>
          </span>
        </div>
      </Container>
    </footer>
  );
}
