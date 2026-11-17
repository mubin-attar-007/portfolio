import type { Metadata, Viewport } from "next";
import { Container } from "@/components/layout/container";
import { DarkSurface } from "@/components/layout/dark-surface";
import { Section } from "@/components/layout/section";
import { EvalsBoard } from "@/components/evals/evals-board";
import { MethodNotes } from "@/components/evals/method-notes";
import { evalsPage } from "@/components/evals/copy";
import { boardRows, projectOptions } from "@/components/evals/rows";
import evalStyles from "@/components/evals/evals.module.css";
import { Button } from "@/components/ui/button";
import { Caret } from "@/components/ui/caret-link";
import { CircuitArt } from "@/components/ui/circuit-art";
import { SectionHeader } from "@/components/ui/section-header";
import { BROWSER_CHROME } from "@/constants/theme";
import { evalsIntro } from "@/content/evals";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/evals",
  title: "Evals",
  description:
    "The eval registry — how each system is measured, the method, and the honest current state.",
});

export const viewport: Viewport = { themeColor: BROWSER_CHROME.dark };

/**
 * /evals — the eval registry as a leaderboard (Clerk LLM Leaderboard pattern)
 * on a dark page: a hero over circuit art, filters, the ranked table, then the
 * full method behind every row and a closing CTA. Source: content/evals.ts only.
 * A retired result stays listed, greyed, with its reason; nothing is tinted as a
 * score unless it is one.
 */
export default function EvalsPage() {
  return (
    <DarkSurface>
      <section className="relative overflow-hidden" aria-labelledby="evals-title">
        <CircuitArt fade="sides" />
        <Container className="relative flex flex-col items-center pt-[clamp(7rem,12vw,10rem)] pb-16 text-center">
          <a href={evalsPage.pill.href} className={evalStyles.pill}>
            <span className={evalStyles.pillDot} aria-hidden="true" />
            {evalsPage.pill.label}
            <span className={evalStyles.pillCta}>
              {evalsPage.pill.cta}
              <Caret />
            </span>
          </a>
          <h1 id="evals-title" className="mt-8 text-display text-ink text-balance">
            {evalsPage.title}
          </h1>
          <p className="mt-6 max-w-[600px] text-page-lead text-ink-secondary">{evalsIntro.lede}</p>
        </Container>
      </section>

      <Section space="xs" ariaLabel={evalsPage.board.caption} className="!bg-transparent">
        <EvalsBoard rows={boardRows} projects={projectOptions} />
      </Section>

      <Section space="sm" id="methods" className="!bg-transparent">
        <SectionHeader kicker={evalsPage.methods.kicker} title={evalsPage.methods.title} lead={evalsPage.methods.lead} />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {evalsIntro.body.map((p) => (
            <p key={p} className="text-[0.9375rem] leading-relaxed text-ink-secondary">
              {p}
            </p>
          ))}
        </div>
        <h3 className="mt-12 mb-2 text-sm font-medium text-ink-tertiary">{evalsPage.methods.terms}</h3>
        <dl className={evalStyles.terms}>
          {evalsIntro.terms.map((d) => (
            <div key={d.term}>
              <dt>{d.term}</dt>
              <dd>{d.def}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-10">
          <MethodNotes />
        </div>
      </Section>

      <Section space="lg" className="!bg-transparent">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-section text-ink text-balance">{evalsPage.cta.title}</h2>
          <p className="mt-4 max-w-[520px] text-ink-secondary">{evalsPage.cta.body}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href={evalsPage.cta.primary.href} variant="violet" size="lg" caret>
              {evalsPage.cta.primary.label}
            </Button>
            <Button href={evalsPage.cta.secondary.href} variant="grey" size="lg">
              {evalsPage.cta.secondary.label}
            </Button>
          </div>
        </div>
      </Section>
    </DarkSurface>
  );
}
