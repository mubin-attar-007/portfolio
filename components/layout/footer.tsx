import Link from "next/link";
import { Container } from "./container";
import { SITE } from "@/config/site";
import { projects } from "@/content/projects";

/**
 * Footer — a quiet multi-column link matrix (Clerk-style) on a faint ground:
 * a brand block + Projects / Site / Elsewhere columns, then a colophon row.
 * A11y: <footer> landmark; column headings label their link groups.
 */
type FLink = { label: string; href: string; ext?: boolean };

const SITE_LINKS: FLink[] = [
  { label: "Work", href: "/work" },
  { label: "Writing", href: "/writing" },
  { label: "About", href: "/about" },
  { label: "Timeline", href: "/timeline" },
  { label: "Résumé", href: "/resume" },
];

function FooterCol({ title, links }: { title: string; links: FLink[] }) {
  return (
    <div>
      <h2 className="font-mono text-xs uppercase tracking-[0.06em] text-ink-tertiary">{title}</h2>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.label}>
            {l.ext ? (
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-ink-secondary transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className="text-sm text-ink-secondary transition-colors hover:text-ink">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({ year }: { year: number }) {
  const elsewhere: FLink[] = [
    { label: "GitHub", href: SITE.socials.github, ext: true },
    { label: "LinkedIn", href: SITE.socials.linkedin, ext: true },
    { label: "Hugging Face", href: SITE.socials.huggingface, ext: true },
    { label: "Email", href: `mailto:${SITE.email}`, ext: true },
  ];
  return (
    <footer className="border-t border-border bg-bg-subtle">
      <Container className="py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="font-mono text-sm font-medium tracking-tight text-ink">
              {SITE.name.toLowerCase()}
            </Link>
            <p className="mt-3 max-w-[28ch] text-sm text-ink-tertiary">
              {SITE.role}. I build grounded AI systems — and show how they actually work.
            </p>
          </div>
          <FooterCol
            title="Projects"
            links={projects.map((p) => ({ label: p.title, href: `/work/${p.slug}` }))}
          />
          <FooterCol title="Site" links={SITE_LINKS} />
          <FooterCol title="Elsewhere" links={elsewhere} />
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 font-mono text-xs text-ink-tertiary md:flex-row md:items-center md:justify-between">
          <span>
            © {year} {SITE.name} · Built with Next.js, TypeScript &amp; Tailwind
          </span>
          <span className="flex items-center gap-4">
            <a href={SITE.socials.github} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
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
