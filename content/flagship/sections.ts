import { FLAGSHIP_LABELS, FLAGSHIP_SECTION_IDS } from "./labels";
import { AGENT_DIRECTION, EMPLOYER, PRIVATE_NOTICE, USAGE, WALKTHROUGH } from "./shared";
import type { Flagship, Sketch } from "./types";

/**
 * A flagship case study as plain text, one section per page band, for a
 * reader that is not the page. Today that is test/flagship-content.test.mts;
 * the assistant indexes the product records directly (lib/ai/corpus.ts).
 * Each section carries the page anchor it renders at
 * (`/work/<slug>#<anchor>`, empty for the top of the page), its title as the
 * page shows it, and its facts as sentences. Nothing here is new copy: every
 * line is read from the product record (./bench-discovery.ts, ./careltc.ts).
 */
export type FlagshipTextSection = { anchor: string; title: string; text: string };

const S = FLAGSHIP_LABELS.sections;

/** Lines joined, the empty ones left out. */
const lines = (...parts: (string | false | null | undefined)[]): string =>
  parts.filter((part): part is string => typeof part === "string" && part.length > 0).join("\n");

/** A sketch in words: each zone with its parts, then each crossing. */
function sketchText(sketch: Sketch): string {
  return lines(
    `${sketch.title}.`,
    ...sketch.zones.map((zone) => `${zone.label}: ${zone.nodes.join("; ")}.`),
    ...sketch.crossings.map((crossing) => `Crossing: ${crossing.label}.`),
    ...(sketch.notes ?? []).map((note) => `Note: ${note}`),
  );
}

/** Every section of one flagship case study, in page order, as plain text. */
export function flagshipSections(flagship: Flagship): FlagshipTextSection[] {
  const usage = USAGE[flagship.slug].sentence;
  return [
    {
      anchor: "",
      title: `${flagship.name}: ${flagship.headline}`,
      text: lines(
        `${flagship.name} is a product built at ${EMPLOYER}: ${flagship.definition}`,
        flagship.summary,
        `Domain: ${flagship.domain}. Status: in use, by ${usage}.`,
        `${FLAGSHIP_LABELS.credit.role}: ${flagship.credit.role}`,
        `${FLAGSHIP_LABELS.credit.agents}: ${AGENT_DIRECTION}`,
        `${PRIVATE_NOTICE}.`,
        ...flagship.figures.map((figure) => `${figure.value} ${figure.label}.`),
      ),
    },
    {
      anchor: FLAGSHIP_SECTION_IDS.tour,
      title: S.tour.title,
      text: lines(
        ...flagship.gallery.flatMap((tab) => tab.shots.map((shot) => `${tab.label} · ${shot.title}: ${shot.proves}`)),
      ),
    },
    {
      anchor: FLAGSHIP_SECTION_IDS.problem,
      title: S.problem.title,
      text: lines(
        ...flagship.problem.body,
        `${S.problem.users}: ${flagship.problem.users.join("; ")}.`,
        ...flagship.built.map((group) => `${S.built.title} · ${group.title}: ${group.items.join("; ")}.`),
      ),
    },
    {
      anchor: FLAGSHIP_SECTION_IDS.recordings,
      title: S.recordings.title,
      text: lines(
        ...flagship.recordings.map((recording) =>
          lines(`${recording.title}: ${recording.summary}`, ...recording.scenes.map((scene) => scene.text)),
        ),
      ),
    },
    {
      anchor: FLAGSHIP_SECTION_IDS.how,
      title: S.how.title,
      text: lines(...flagship.trace.map((step, i) => `${i + 1}. ${step.title}: ${step.body}`)),
    },
    {
      anchor: FLAGSHIP_SECTION_IDS.highlights,
      title: S.highlights.title,
      text: lines(...flagship.highlights.map((highlight) => `${highlight.title}: ${highlight.body}`)),
    },
    {
      anchor: FLAGSHIP_SECTION_IDS.architecture,
      title: S.architecture.title,
      text: lines(
        ...[flagship.sketch, ...flagship.moreSketches].map(sketchText),
        ...flagship.boundary.map(
          (row) => `${row.data}: ${S.architecture.direction[row.direction].toLowerCase()} (${row.path}). ${row.rule}`,
        ),
      ),
    },
    {
      anchor: FLAGSHIP_SECTION_IDS.code,
      title: S.code.title,
      text: lines(...flagship.excerpts.map((excerpt) => `${excerpt.title} (${excerpt.file}): ${excerpt.story}`)),
    },
    {
      anchor: FLAGSHIP_SECTION_IDS.constraints,
      title: S.constraints.title,
      text: lines(
        ...flagship.constraints.map((row) => `${row.constraint}. It forced: ${row.forced} Checked by: ${row.checked}`),
        flagship.constraintsNote,
      ),
    },
    {
      anchor: FLAGSHIP_SECTION_IDS.broke,
      title: S.broke.title,
      text: lines(
        ...flagship.incidents.map(
          (incident) =>
            `${incident.title}. ${incident.broke} Cause: ${incident.cause} What changed: ${incident.change} Guard: ${incident.guard}`,
        ),
      ),
    },
    {
      anchor: FLAGSHIP_SECTION_IDS.decisions,
      title: S.decisions.title,
      text: lines(
        ...flagship.decisions.map(
          (decision) =>
            `${decision.choice}, instead of ${decision.instead}. Why: ${decision.reason} Trade-off: ${decision.tradeoff}`,
        ),
      ),
    },
    {
      anchor: FLAGSHIP_SECTION_IDS.verification,
      title: S.verification.title,
      text: lines(
        ...flagship.verification.suites.map((suite) => `${suite.value} ${suite.label}. ${suite.method}`),
        `${S.verification.checks}: ${flagship.verification.checks.join("; ")}.`,
        `${S.verification.notMeasured}: ${flagship.verification.notMeasured.join("; ")}.`,
      ),
    },
    {
      anchor: FLAGSHIP_SECTION_IDS.deployment,
      title: S.deployment.title,
      text: lines(
        ...flagship.deployment.map((card) => `${card.title}: ${card.body}`),
        `${S.architecture.aws}: ${flagship.stack.aws.join(", ")}.`,
        ...flagship.stack.groups.map((group) => `${group.label}: ${group.items.join(", ")}.`),
      ),
    },
    {
      anchor: FLAGSHIP_SECTION_IDS.outcome,
      title: S.outcome.title,
      text: lines(
        `${S.outcome.proves}: ${flagship.outcome.proves.join(" ")}`,
        `${S.outcome.notShown}: ${flagship.outcome.notShown.join("; ")}.`,
      ),
    },
    {
      anchor: FLAGSHIP_SECTION_IDS.walkthrough,
      title: S.walkthrough.title,
      text: lines(
        S.walkthrough.lead,
        `${S.walkthrough.covers}: ${WALKTHROUGH.covers.join("; ")}.`,
        `${S.walkthrough.staysPrivate}: ${WALKTHROUGH.staysPrivate.join("; ")}.`,
      ),
    },
  ];
}
