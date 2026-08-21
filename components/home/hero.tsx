import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { BoundaryMark } from "@/components/ui/boundary-mark";
import { buttonVariants } from "@/components/ui/button";
import { flagshipHome } from "@/content/home-visual";
import { EvidenceGraph } from "./evidence-graph";
import { HeroProductStage } from "./hero-stage";

/**
 * Hero — the first five seconds.
 *
 * Centred and light-first. The whole section answers four questions in one
 * screen: who this is (eyebrow), what he builds (headline), how he builds it
 * (lede), and what to do next (one primary action). Nothing else is allowed in.
 *
 * Type: the headline runs 40px on a 360px phone and 84px at 1440, solved as a
 * pinned clamp in tokens.css rather than a guessed `vw`. It breaks as two
 * deliberate lines at every width — the second line carries the accent because
 * it is the half of the sentence that makes the actual claim.
 *
 * Fold budget at 1440×900: availability bar + header (104) + hero top (64) +
 * eyebrow, headline, lede and the action pair (≈420) leaves roughly
 * 270px of the product stage visible above the fold. That is the intended
 * reading — the stage should be *started*, not finished, on first paint.
 *
 * The background is the site's own `EvidenceGraph`, masked out from under the
 * copy so the text sits on clean paper. It is decorative and hidden from
 * assistive technology; the four stages it draws are named in prose further down
 * the page, so nothing depends on seeing it.
 *
 * `overflow-hidden` is load-bearing: the artwork is deliberately wider than the
 * viewport, and this is what keeps that from becoming horizontal scroll.
 */
export function Hero() {
  const { hero } = flagshipHome;

  return (
    <section
      className="relative overflow-hidden pb-[var(--space-section-md)] pt-14 sm:pt-20 lg:pt-28"
      aria-labelledby="home-title"
    >
      <EvidenceGraph />

      <Container className="relative">
        <div className="reveal mx-auto flex max-w-[var(--width-hero)] flex-col items-center text-center">
          <p className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-border bg-surface/80 py-1 pl-2 pr-3 text-xs font-medium tracking-[0.01em] text-ink-secondary shadow-[var(--shadow-sm)] backdrop-blur-sm">
            <BoundaryMark size={13} className="text-accent" />
            {hero.eyebrow}
          </p>

          <h1
            id="home-title"
            className="mt-6 text-balance text-display font-bold text-ink sm:mt-7"
          >
            <span className="block">{hero.titleLead}</span>
            {/* The claim line carries the display gradient. background-clip
                text with a solid accent fallback: if the clip is unsupported
                the line is simply accent-coloured, never invisible. */}
            <span className="block bg-[image:var(--gradient-accent)] bg-clip-text text-accent [-webkit-background-clip:text] supports-[background-clip:text]:text-transparent">
              {hero.titleAccent}
            </span>
          </h1>

          <p className="mt-5 max-w-[46ch] text-pretty text-base text-ink-secondary sm:mt-6 sm:text-lg">
            {hero.ledeParts.map((part, i) =>
              "strong" in part && part.strong ? (
                <strong key={i} className="font-medium text-ink">
                  {part.t}
                </strong>
              ) : (
                <span key={i}>{part.t}</span>
              ),
            )}
          </p>

          {/* One primary action. The secondary is a real control rather than a
              second filled button — two filled buttons is two primary actions
              wearing the same clothes. */}
          <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link
              href={hero.primary.href}
              prefetch={false}
              className={buttonVariants("primary", "lg")}
            >
              {hero.primary.label}
              <ArrowRight size={15} strokeWidth={2.25} aria-hidden />
            </Link>
            <Link
              href={hero.secondary.href}
              prefetch={false}
              className={buttonVariants("secondary", "lg")}
            >
              {hero.secondary.label}
            </Link>
          </div>

        </div>

        <div className="reveal mt-14 sm:mt-16 lg:mt-20">
          <HeroProductStage />
        </div>
      </Container>
    </section>
  );
}
