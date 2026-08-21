import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { SITE, STATUS } from "@/config/site";
import { flagshipHome } from "@/content/home-visual";
import { EvidenceGraph } from "./evidence-graph";

/**
 * FinalContactCTA — the page's one closing conversion section, and the second
 * (and last) dark plate.
 *
 * It asks a question rather than announcing availability, because the visitor
 * who reaches the bottom of this page has already read the availability line
 * twice — in the bar above the header and in the footer below. The headline is
 * the qualifying question; the body says what a first conversation is actually
 * about.
 *
 * There is no contact FORM here. /hire already owns one, and a duplicate form on
 * the homepage means two places for a message to be typed and one of them to be
 * wrong. The literal email sits underneath for the visitor who would rather not
 * click through at all.
 *
 * The background is the `quiet` variant of the same evidence motif the hero
 * uses, so the page opens and closes on the same drawing.
 *
 * A11y: one `<h2>`; the availability dot is decorative and its sentence carries
 * the meaning; the whole section is a landmark labelled by its heading.
 */
export function FinalContactCTA() {
  const c = flagshipHome.close;

  return (
    <section
      className="tone-invert relative overflow-hidden py-[var(--space-section-lg)]"
      aria-labelledby="contact-title"
    >
      <EvidenceGraph variant="quiet" />
      {/* The plate's own light: a gradient hairline where the light page meets
          it, and one violet radial rising behind the headline. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent_8%,color-mix(in_srgb,var(--color-accent)_65%,transparent)_50%,transparent_92%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[26rem] w-[52rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-accent)_17%,transparent),transparent)]"
      />

      <Container className="relative">
        <div className="mx-auto flex max-w-[46rem] flex-col items-center text-center">
          <h2
            id="contact-title"
            className="text-balance text-section font-[560] text-ink"
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
