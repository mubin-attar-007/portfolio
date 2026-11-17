import { WorkSubnav } from "@/components/layout/work-subnav";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import type { Neighbour } from "@/components/work/neighbour-cards";
import type { Flagship } from "@/content/flagship/types";
import { CASE_STUDY_STARTERS } from "@/lib/ai/starters";
import { absoluteUrl } from "@/lib/seo";
import { FlagshipHero } from "./flagship-hero";
import { Highlights } from "./highlights";
import { Recordings } from "./recordings";
import { ConstraintsSection, ProblemSection, TourSection } from "./report-context";
import {
  CodeExcerpts,
  DecisionsSection,
  IncidentsSection,
  OutcomeSection,
  VerificationSection,
  WalkthroughSection,
} from "./report-record";
import { ArchitectureSection, DeploymentSection, HowItWorks } from "./report-system";

/**
 * FlagshipPage — a flagship case study (Bench Discovery, CareLTC) in the
 * Clerk product-page pattern, with the real app on dummy data. The order sets
 * the page's tempo: adjacent bands change ground (canvas, sunken, the dark
 * plate) or density, and no two card grids or dark plates meet.
 *
 *   sub-nav · hero · product tour · the problem and what I built ·
 *   recordings · how it works · engineering highlights (plate) ·
 *   architecture · code · constraints · what broke · decisions ·
 *   verification · deployment and stack · outcome · walkthrough and prev/next
 */
export function FlagshipPage({
  flagship,
  previous,
  next,
}: {
  flagship: Flagship;
  previous: Neighbour | null;
  next: Neighbour | null;
}) {
  const url = absoluteUrl(`/work/${flagship.slug}`);
  return (
    <>
      <WorkSubnav current={flagship.slug} />
      <BreadcrumbJsonLd
        items={[
          { name: "Work", url: absoluteUrl("/work") },
          { name: flagship.name, url },
        ]}
      />
      <FlagshipHero flagship={flagship} />
      <TourSection flagship={flagship} />
      <ProblemSection flagship={flagship} />
      <Recordings flagship={flagship} />
      <HowItWorks flagship={flagship} />
      <Highlights flagship={flagship} />
      <ArchitectureSection flagship={flagship} />
      <CodeExcerpts flagship={flagship} />
      <ConstraintsSection flagship={flagship} />
      <IncidentsSection flagship={flagship} />
      <DecisionsSection flagship={flagship} />
      <VerificationSection flagship={flagship} />
      <DeploymentSection flagship={flagship} />
      <OutcomeSection flagship={flagship} />
      <WalkthroughSection
        product={flagship.name}
        questions={CASE_STUDY_STARTERS[flagship.slug] ?? []}
        previous={previous}
        next={next}
      />
    </>
  );
}
