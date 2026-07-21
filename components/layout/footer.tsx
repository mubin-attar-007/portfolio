import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "./container";
import { BoundaryMark } from "@/components/ui/boundary-mark";
import { LABEL } from "@/constants/page";
import { SITE, STATUS, FOOTER } from "@/config/site";
import { FOOTER_NAV } from "@/config/nav";

/**
 * Footer — Clerk's footer anatomy adapted to a personal brand: an identity
 * column on the left (Clerk parks its logo there; we spend it on a serif
 * sign-off, one clear way to reach me, and the availability line), the complete
 * link map packed into tight adjacent columns on the right — NOT columns
 * scattered across the full container width, which is what made the old map
 * read sparse instead of ordered — then ONE hairline and a colophon bar.
 * Like Clerk's, the footer carries no background of its own and no top border:
 * it is the quiet end of the page surface, separated by whitespace (and, on the
 * homepage, by the dark close's chamfered bottom seam).
 *
 * Density is Clerk's measured rhythm: 36px from a column heading to its first
 * link, 28px link pitch (20px line + 8px gap), links in full-ink so the map
 * reads crisp against the tertiary headings.
 *
 * A11y: <footer> landmark; each link group is a labelled nav landmark; every
 * link is keyboard-operable with a visible focus ring; the status dot is
 * decorative.
 */
type FLink = { label: string; href: string };

const PROFILES: FLink[] = [
  { label: "GitHub", href: SITE.socials.github },
  { label: "LinkedIn", href: SITE.socials.linkedin },
  { label: "Hugging Face", href: SITE.socials.huggingface },
];

/** One column of the link map — shared by internal groups and the profiles. */
const FOOTER_LINK = "text-sm text-ink transition-colors hover:text-ink-secondary";

export function Footer({ year }: { year: number }) {
  return (
    <footer className="bg-bg">
      {/* Asymmetric: weight at the top where the identity column lands, less
          underneath the colophon — a footer padded evenly ends in a dead strip. */}
      <Container className="pb-10 pt-16 sm:pb-12 sm:pt-20">
        <div className="grid gap-y-12 md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-16">
          {/* Identity — the personal replacement for Clerk's logo column:
              sign-off to the reader who scrolled the evidence, one invitation,
              the literal email, and the availability line. */}
          <div className="max-w-[40ch]">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-sm font-medium tracking-tight text-ink"
            >
              <BoundaryMark size={17} className="text-ink" />
              {SITE.name.toLowerCase()}
            </Link>
            <p className="mt-5 font-serif text-2xl italic leading-snug text-ink">
              {FOOTER.signoff}
            </p>
            <p className="mt-3 max-w-[36ch] text-sm text-ink-secondary">{FOOTER.invite}</p>
            <p className="mt-8">
              <a
                href={`mailto:${SITE.email}`}
                className="group inline-flex items-center gap-2 text-base text-ink"
              >
                <span className="link-underline">{SITE.email}</span>
                <ArrowUpRight
                  size={16}
                  strokeWidth={1.5}
                  className="text-ink-tertiary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </a>
            </p>
            <p className="mt-4 inline-flex items-center gap-2 font-mono text-xs text-ink-tertiary">
              <span className="h-1.5 w-1.5 rounded-full bg-positive" aria-hidden />
              {STATUS.text}
            </p>
          </div>

          {/* The link map — grouped so nothing is orphaned (Explore · Me ·
              Elsewhere), columns adjacent at Clerk's pitch instead of stretched
              to the container's thirds. */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 md:gap-x-14 lg:gap-x-16">
            {FOOTER_NAV.map((group) => (
              <nav key={group.heading} aria-label={group.heading}>
                <h2 className={LABEL}>{group.heading}</h2>
                <ul className="mt-5 flex flex-col gap-2">
                  {group.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className={FOOTER_LINK}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <nav aria-label="Elsewhere">
              <h2 className={LABEL}>Elsewhere</h2>
              <ul className="mt-5 flex flex-col gap-2">
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

        {/* Colophon — ONE hairline-separated bottom bar, like Clerk's: © left,
            the build credits right. The hairline is `.rule-fade` (dies before
            the gutter) rather than a border, so the bar closes the page without
            boxing it in. */}
        <hr className="rule-fade mt-14" />
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
              className="transition-colors hover:text-ink"
            >
              GitHub
            </a>
            <a href="/llms.txt" className="transition-colors hover:text-ink">
              llms.txt
            </a>
          </span>
        </div>
      </Container>
    </footer>
  );
}
