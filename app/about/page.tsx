import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { about } from "@/content/site";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description: "Mubin Attar — AI/ML engineer. Who I am, what I build, and the one rule across all of it.",
  alternates: { canonical: `${SITE.url}/about` },
};

export default function AboutPage() {
  return (
    <Section space="lg">
      <p className="font-mono text-xs uppercase text-ink-tertiary">About</p>
      <h1 className="mt-6 max-w-[20ch] text-4xl text-ink sm:text-5xl">{about.headline}</h1>
      <div className="mt-8 flex max-w-[var(--width-prose)] flex-col gap-4 text-lg text-ink-secondary">
        {about.body.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-5 text-sm">
        <a href={SITE.socials.github} target="_blank" rel="noopener noreferrer" className="text-ink underline decoration-border-strong underline-offset-4 hover:decoration-accent">
          GitHub
        </a>
        <a href={SITE.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-ink underline decoration-border-strong underline-offset-4 hover:decoration-accent">
          LinkedIn
        </a>
        <Link href="/resume" className="text-ink underline decoration-border-strong underline-offset-4 hover:decoration-accent">
          Résumé
        </Link>
        <Link href="/timeline" className="text-ink underline decoration-border-strong underline-offset-4 hover:decoration-accent">
          Timeline
        </Link>
      </div>
    </Section>
  );
}
