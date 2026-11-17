import { WorkSubnav } from "@/components/layout/work-subnav";
import type { FieldReport } from "@/content/field";
import { DraftRibbon, FieldHero } from "./field-hero";
import { BuiltSection, ConstraintsSection, ProblemSection } from "./report-context";
import {
  DecisionsSection,
  IncidentsSection,
  OutcomeSection,
  VerificationSection,
  WalkthroughSection,
} from "./report-record";
import { ArchitectureSection, BoundarySection, DeploymentSection, TraceSection } from "./report-system";

/**
 * FieldReportPage — the whole field report, in the fixed order of the track
 * brief: sub-nav, draft ribbon, hero, problem, constraints, what I built, the
 * trace, architecture, boundary ledger, deployment, what broke, decisions,
 * verification, outcome, walkthrough.
 */
export function FieldReportPage({ report }: { report: FieldReport }) {
  return (
    <>
      <WorkSubnav current={report.slug} />
      {report.published ? null : <DraftRibbon />}
      <FieldHero report={report} />
      <ProblemSection report={report} />
      <ConstraintsSection report={report} />
      <BuiltSection report={report} />
      <TraceSection report={report} />
      <ArchitectureSection report={report} />
      <BoundarySection report={report} />
      <DeploymentSection report={report} />
      <IncidentsSection report={report} />
      <DecisionsSection report={report} />
      <VerificationSection report={report} />
      <OutcomeSection report={report} />
      <WalkthroughSection report={report} />
    </>
  );
}
