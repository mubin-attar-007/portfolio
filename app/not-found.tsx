import Link from "next/link";
import { Section } from "@/components/layout/section";

/**
 * 404 — one honest sentence + routes back into the site. Never a dead end.
 */
export default function NotFound() {
  return (
    <Section space="lg">
      <p className="font-mono text-xs uppercase text-ink-tertiary">404</p>
      <h1 className="mt-6 max-w-[20ch] text-3xl font-[560] text-ink sm:text-4xl">
        That page doesn&apos;t exist.
      </h1>
      <p className="mt-6 max-w-[var(--width-prose)] text-lg text-ink-secondary">
        The link may be old or mistyped. Try the work, the writing, or head home.
      </p>
      <div className="mt-8 flex flex-wrap gap-5 text-sm">
        <Link href="/work" className="text-ink underline decoration-border-strong underline-offset-4 hover:decoration-accent">
          Work
        </Link>
        <Link href="/writing" className="text-ink underline decoration-border-strong underline-offset-4 hover:decoration-accent">
          Writing
        </Link>
        <Link href="/" className="text-ink underline decoration-border-strong underline-offset-4 hover:decoration-accent">
          Home
        </Link>
      </div>
    </Section>
  );
}
