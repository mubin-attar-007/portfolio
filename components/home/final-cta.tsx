import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { SITE, STATUS } from "@/config/site";
import { flagshipHome } from "@/content/home-visual";

/** A direct contact invitation, with the address usable without a form. */
export function FinalContactCTA() {
  const c = flagshipHome.close;

  return (
    <section
      className="tone-invert relative overflow-hidden py-[var(--space-section-sm)]"
      aria-labelledby="contact-title"
    >
      <Container className="relative">
        <div className="mx-auto flex max-w-[46rem] flex-col items-center text-center">
          <h2
            id="contact-title"
            className="text-balance text-section font-bold text-ink"
          >
            {c.title}
          </h2>
          <p className="mt-5 max-w-[44ch] text-balance text-lg text-ink-secondary">
            {c.body}
          </p>

          <div className="mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link
              href={c.primary.href}
              prefetch={false}
              className={buttonVariants("primary", "lg")}
            >
              {c.primary.label}
              <ArrowRight size={15} strokeWidth={2.25} aria-hidden />
            </Link>
            <Link
              href={c.secondary.href}
              prefetch={false}
              className={buttonVariants("secondary", "lg")}
            >
              {c.secondary.label}
            </Link>
          </div>

          <p className="mt-8 flex flex-col items-center gap-2 text-sm text-ink-tertiary sm:flex-row sm:gap-3">
            <a href={`mailto:${SITE.email}`} className="font-medium text-ink">
              <span className="link-underline">{SITE.email}</span>
            </a>
            <span aria-hidden className="hidden h-3 w-px bg-border-strong sm:block" />
            {/* The dot is INLINE with the first word, not a flex sibling of a
                centred multi-line block — as a sibling it detached to the far
                margin whenever the sentence wrapped. */}
            <span>
              <span
                aria-hidden
                className="mr-2 inline-block h-1.5 w-1.5 rounded-[var(--radius-pill)] bg-positive"
              />
              {STATUS.text}
            </span>
          </p>
        </div>
      </Container>
    </section>
  );
}
