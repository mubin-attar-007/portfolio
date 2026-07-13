import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { about } from "@/content/site";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description: "Mubin Attar — AI/ML engineer. Who I am, what I build, and the one rule across all of it.",
  alternates: { canonical: `${SITE.url}/about` },
};

const LINKS = [
  { label: "GitHub", href: SITE.socials.github, external: true },
  { label: "LinkedIn", href: SITE.socials.linkedin, external: true },
  { label: "Résumé", href: "/resume", external: false },
  { label: "Timeline", href: "/timeline", external: false },
] as const;

export default function AboutPage() {
  return (
    <Section space="lg">
      <p className="font-mono text-xs uppercase text-ink-tertiary">About</p>
      <div className="mt-6 grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-16">
        <div className="min-w-0">
          <h1 className="max-w-[20ch] text-4xl text-ink sm:text-5xl">{about.headline}</h1>
          <div className="mt-8 flex max-w-[var(--width-prose)] flex-col gap-4 text-lg text-ink-secondary">
            {about.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-5 text-sm">
            {LINKS.map((l) =>
              l.external ? (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline decoration-border-strong underline-offset-4 hover:decoration-accent"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-ink underline decoration-border-strong underline-offset-4 hover:decoration-accent"
                >
                  {l.label}
                </Link>
              ),
            )}
          </div>
        </div>
        {/* Real headshot with card treatment (1px border, radius-md, no filters) — DESIGN §5. */}
        <Image
          src="/mubin.png"
          alt="Mubin Attar"
          width={369}
          height={461}
          sizes="(max-width: 768px) 45vw, 220px"
          priority
          className="order-first h-auto w-40 rounded-[var(--radius-md)] border border-border sm:w-48 md:order-none md:w-[220px]"
        />
      </div>
    </Section>
  );
}
