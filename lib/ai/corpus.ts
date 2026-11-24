// -----------------------------------------------------------------------------
// The assistant's corpus: the published content of this site, as passages.
//
// Built once, at module load, from the same sources the pages render — the
// flagship case studies, the project registry, the résumé, the evaluation
// registry, the page copy modules, the site config, /now, the essays and notes
// — so a fact changed on a page changes in the assistant's index with it. Only
// two sources are written for the assistant: the FAQ (content/faq.json) and the
// public case-study write-ups (content/projects/*.mdx).
//
// Every passage carries the site pages a reader can open to check it. Those
// links are built here, from content, and never from anything a model writes.
//
// The first line of each built passage is a title in the words visitors ask
// with ("contact", "email", "where he works"). Retrieval is lexical (ADR-006),
// so a title that names what a passage covers is what lets a four-word
// question find it. Titles describe; they never add a fact.
// -----------------------------------------------------------------------------

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import faqData from "@/content/faq.json";
import { resume } from "@/content/resume";
import { projects } from "@/content/projects";
import { evals, evalAnchor, evalsIntro } from "@/content/evals";
import { PROJECT_LINKS, PROJECT_STATUS_LABEL } from "@/content/article";
import { flagships, type Flagship } from "@/content/flagship";
import { FLAGSHIP_LABELS, FLAGSHIP_SECTION_IDS } from "@/content/flagship/labels";
import { AGENT_DIRECTION, EMPLOYER, PRIVATE_NOTICE, REAL_APP, USAGE, WALKTHROUGH } from "@/content/flagship/shared";
import { aboutPage } from "@/content/pages/about";
import { contactPage } from "@/content/pages/contact";
import { evaluatePage } from "@/content/pages/evaluate";
import { hirePage } from "@/content/pages/hire";
import { EVIDENCE, TRUST_PAGE } from "@/content/pages/trust";
import { TOOL_NOTES } from "@/content/pages/uses";
import { home, trust, uses } from "@/content/site";
import { NoteSchema, NowSchema, WritingSchema, type EvalRow } from "@/content/schema";
import { FOOTER, INTEGRATIONS, SITE, STATUS } from "@/config/site";
import { CONTENT_SLUG } from "@/lib/content-slug";
import { byDateDesc } from "@/lib/feed";
import { formatDate } from "@/lib/format";
import type { CitationLink } from "./chat-contract";
import { citationLinks, mergeLinks } from "./citation-links";

/** What a passage was built from. */
export type PassageKind =
  | "faq"
  | "project"
  | "case-study"
  | "profile"
  | "contact"
  | "hire"
  | "resume"
  | "skills"
  | "page"
  | "evaluation"
  | "evaluation-guide"
  | "work-index"
  | "writing"
  | "writing-index"
  | "note";

/** A single retrievable unit of real site content. */
export type Passage = {
  /** Stable id, e.g. "faq-2" or "cs-careltc-what-broke-ios-session". */
  id: string;
  /**
   * The retrievable text. Its first line is a title (e.g. "DBWhisper —
   * Architecture"); the grounded fallback shows the rest of it verbatim.
   */
  text: string;
  /**
   * What the index matches, when it is not `text`. A listing is found by what
   * it is ("what he has written"), not by the titles it lists — otherwise it
   * would outrank every entry it names.
   */
  searchText?: string;
  /** Human-readable origin, e.g. "CareLTC case study — What broke". Shown to the model, never as a link. */
  source: string;
  kind: PassageKind;
  /** Site pages a reader can open to check this passage, each with a readable label. */
  links: readonly CitationLink[];
  /**
   * Slugs of the projects this passage is about. For the site's own record of
   * a project — the overview, a case-study section, an evaluation row, an FAQ
   * answer whose source names it — these are the projects it records. Essays
   * and notes (`COMMENTARY_KINDS`) are commentary: theirs are the projects the
   * piece names, which keeps them from answering a question about another
   * project but never puts them ahead of the record of the one asked about.
   */
  projects: readonly string[];
  /** The benchmark an evaluation passage reports on ("Spider"). */
  benchmark?: string;
  /** True for an evaluation result the registry has withdrawn. */
  retired?: true;
};

/** Passage kinds that comment on projects rather than record them. */
export const COMMENTARY_KINDS: ReadonlySet<PassageKind> = new Set(["writing", "note"]);

/** A project as a question can name it. */
export type ProjectName = { slug: string; title: string };

/** Every product and project, by the name a visitor would type: the flagships first. */
export const PROJECT_NAMES: readonly ProjectName[] = [
  ...flagships.map(({ slug, name }) => ({ slug, title: name })),
  ...projects.map(({ slug, title }) => ({ slug, title })),
];

// Literal paths, one per collection, and each read written out at its call site
// as `readFileSync(path.join(<DIR>, …))`: Next's output-file tracer follows a
// path it can read statically, which is what puts these files into the
// /api/chat bundle on Vercel. A read through a helper taking the path as a
// parameter is invisible to it.
const CONTENT_DIR = path.join(process.cwd(), "content");
const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");
const WRITING_DIR = path.join(process.cwd(), "content", "writing");
const NOTES_DIR = path.join(process.cwd(), "content", "notes");

// ---------------------------------------------------------------------------
// MDX helpers
// ---------------------------------------------------------------------------

/** Line endings normalized, so CRLF checkouts parse like LF ones. */
const lf = (text: string): string => text.replace(/\r\n?/g, "\n");

/** One frontmatter scalar: a quoted string, a boolean, a number, or bare text. */
function frontmatterScalar(raw: string): unknown {
  const value = raw.trim();
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
  if (value.startsWith('"')) {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return value.slice(1, -1);
    }
  }
  if (value.startsWith("'")) return value.slice(1, -1).replace(/''/g, "'");
  return value;
}

/**
 * Split an MDX file into its frontmatter and body.
 *
 * The pages read frontmatter through next-mdx-remote, which is asynchronous and
 * compiles the body to React; this index is built synchronously at module load
 * and must run under a plain `node --test`, so it reads the frontmatter itself.
 * It understands the forms this repo writes — `key: "string"`, `key: true`,
 * `key: ["a", "b"]`, block lists of scalars, and block lists of flat records
 * (`- title: "…"` with its `body: "…"` indented below) — and throws on anything
 * else, so an unusual file fails the test suite instead of silently leaving the
 * index. The result is then validated with the same Zod schema the pages use.
 */
export function splitFrontmatter(source: string, file: string): { data: Record<string, unknown>; body: string } {
  const match = /^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(source);
  if (!match) return { data: {}, body: source };
  const data: Record<string, unknown> = {};
  let list: unknown[] | null = null;
  for (const line of match[1]!.split("\n")) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    // A list item that opens a record: `  - title: "…"`.
    const record = /^\s+-\s+([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (record && list) {
      list.push({ [record[1]!]: frontmatterScalar(record[2]!) });
      continue;
    }
    const item = /^\s+-\s+(.*)$/.exec(line);
    if (item && list) {
      list.push(frontmatterScalar(item[1]!));
      continue;
    }
    // A further field of the record above: `    body: "…"`.
    const field = /^\s+([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    const open = list?.at(-1);
    if (field && typeof open === "object" && open !== null) {
      (open as Record<string, unknown>)[field[1]!] = frontmatterScalar(field[2]!);
      continue;
    }
    const pair = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!pair) throw new Error(`Unsupported frontmatter in ${file}: "${line.trim()}"`);
    const key = pair[1]!;
    const value = pair[2]!.trim();
    if (value === "") {
      list = [];
      data[key] = list;
    } else if (value.startsWith("[") && value.endsWith("]")) {
      list = null;
      try {
        data[key] = JSON.parse(value) as unknown;
      } catch {
        const inner = value.slice(1, -1).trim();
        data[key] = inner ? inner.split(",").map(frontmatterScalar) : [];
      }
    } else {
      list = null;
      data[key] = frontmatterScalar(value);
    }
  }
  return { data, body: source.slice(match[0].length) };
}

/**
 * The body of an MDX file whose frontmatter nothing validates (the case-study
 * write-ups): the block is skipped, not parsed, so its shape can never break
 * the index.
 */
function bodyOf(source: string): string {
  return source.replace(/^---\n[\s\S]*?\n---[ \t]*(?:\n|$)/, "");
}

/** Split a markdown body into its intro and its `##` sections. */
function sectionsOf(body: string): { heading: string | null; body: string }[] {
  const sections: { heading: string | null; body: string }[] = [];
  const re = /^##\s+(.+?)\s*$/gm;
  let heading: string | null = null;
  let start = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const text = body.slice(start, m.index).trim();
    if (text) sections.push({ heading, body: text });
    heading = m[1]!.trim();
    start = re.lastIndex;
  }
  const rest = body.slice(start).trim();
  if (rest) sections.push({ heading, body: rest });
  return sections;
}

/** Strip MDX/markdown noise so the retrieval text is clean prose. */
function stripMarkdown(md: string): string {
  return (
    md
      // MDX comments and JSX tags: keep any text between tags.
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
      .replace(/<\/?[A-Za-z][^>]*>/g, " ")
      // fenced code blocks → keep inner text (schematics carry table/keyword names)
      .replace(/```[a-z]*\n?/g, " ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1$2")
      .replace(/(^|[\s(])_([^_\n]+)_/g, "$1$2")
      .replace(/^\s{0,3}#{1,6}\s+/gm, "")
      .replace(/[#>|]/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

/** "Key Decisions & Trade-offs" → "key-decisions-trade-offs". */
const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Lines joined, with the ones a source does not have left out. */
const lines = (...parts: (string | null | false | undefined)[]): string =>
  parts.filter((part): part is string => typeof part === "string" && part.length > 0).join("\n");

/** A sentence's closing stop, once: "on the PC." stays, "on the PC" gains one. */
const sentence = (text: string): string => (/[.!?…]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`);

/** A sentence without its closing stop, to run it into another. */
const clause = (text: string): string => text.trim().replace(/[.!?]+$/, "");

/** The first sentence of a paragraph. */
const firstSentence = (text: string): string => /^.*?[.!?](?=\s|$)/.exec(text.trim())?.[0] ?? text.trim();

/** How one collection is read: its directory listing and one file's source. */
type CollectionReader = { label: "writing" | "notes"; list: () => string[]; read: (file: string) => string };

/**
 * Published entries of one collection, validated as the pages validate them.
 *
 * A missing directory is logged, not thrown: on a deploy it means the files
 * were not bundled with the route, and the assistant would otherwise stop
 * citing a whole collection without a trace.
 */
function readCollection<T extends { slug: string; draft: boolean }>(
  reader: CollectionReader,
  schema: { parse: (input: unknown) => T },
): { meta: T; body: string }[] {
  let files: string[];
  try {
    files = reader.list();
  } catch {
    console.warn(`[assistant] content/${reader.label} is not readable; its entries are not searchable`);
    return [];
  }
  return files
    .filter((file) => file.endsWith(".mdx") && CONTENT_SLUG.test(file.slice(0, -4)))
    .sort()
    .map((file) => {
      const { data, body } = splitFrontmatter(lf(reader.read(file)), `content/${reader.label}/${file}`);
      return { meta: schema.parse({ ...data, slug: file.slice(0, -4) }), body };
    })
    // A draft is unpublished: it is not on the site, so it is not in the index.
    .filter((entry) => !entry.meta.draft);
}

/** Projects named in a piece of text, by title ("LLM Studio", "CareLTC"). */
function projectsNamedIn(text: string): string[] {
  const lower = text.toLowerCase();
  return PROJECT_NAMES.filter((p) => lower.includes(p.title.toLowerCase())).map((p) => p.slug);
}

// ---------------------------------------------------------------------------
// Pages, as a citation names them
// ---------------------------------------------------------------------------

/** The site pages passages cite, each with the label its chip shows. */
const PAGE = {
  work: { label: "Work", href: "/work" },
  hire: { label: "Hiring", href: "/hire" },
  contact: { label: "Contact", href: "/contact" },
  resume: { label: "Résumé", href: "/resume" },
  about: { label: "About Mubin", href: "/about" },
  skills: { label: "Skills", href: "/skills" },
  uses: { label: "Uses", href: "/uses" },
  now: { label: "Now", href: "/now" },
  trust: { label: "Trust", href: "/trust" },
  evaluate: { label: "Evaluate with your AI", href: "/evaluate" },
  evals: { label: "Evals", href: "/evals" },
  writing: { label: "Writing", href: "/writing" },
  notes: { label: "Notes", href: "/notes" },
} as const satisfies Record<string, CitationLink>;

/** A project or flagship's case study, optionally at one of its sections. */
const caseStudyLink = (slug: string, title: string, section?: string): CitationLink => ({
  label: title,
  href: section ? `/work/${slug}#${section}` : `/work/${slug}`,
});

// ---------------------------------------------------------------------------
// Passages, one builder per source
// ---------------------------------------------------------------------------

/** The FAQ — written for the assistant. One passage per question. */
function faqPassages(): Passage[] {
  return faqData.faq.map((item, i) => ({
    id: `faq-${i}`,
    text: `${item.question}\n${item.answer}`,
    // The FAQ's source string is for the model and the maintainers; visitors
    // see only the pages it resolves to.
    source: `FAQ — ${item.source}`,
    kind: "faq" as const,
    links: citationLinks(item.source),
    projects: projectsNamedIn(item.source),
  }));
}

/** A flagship's usage, in the exact approved wording. */
const usageOf = (flagship: Flagship): string => USAGE[flagship.slug].sentence;

/** A flagship's credit, verbatim and in his words: the approved wording is first person. */
const creditOf = (flagship: Flagship): string => `His role, in his words: “${flagship.credit.role}”`;

/**
 * The flagship overview: what it is, who uses it, his role, its stack and where
 * it runs. The stack line says "tech stack" as a public project's overview
 * does, so "What is CareLTC's tech stack?" finds CareLTC's record, not another
 * product's that happens to use the word.
 */
function flagshipOverview(flagship: Flagship): Passage {
  const tested = flagship.figures.filter((f) => f.source === "verification").map((f) => `${f.value} (${f.label})`);
  return {
    id: `project-${flagship.slug}`,
    text: lines(
      `${flagship.name} — flagship case study: what it is, who uses it, his role, its tech stack and where it runs`,
      `${flagship.name}: ${flagship.definition}`,
      flagship.summary,
      `${FLAGSHIP_LABELS.pills.employer}. Who it is for: ${sentence(flagship.domain)}`,
      `Usage: ${usageOf(flagship)}. ${FLAGSHIP_LABELS.figures.approved}`,
      creditOf(flagship),
      `What it does: ${flagship.card.body}`,
      tested.length > 0 ? `Test figures on the page: ${tested.join("; ")}.` : null,
      `Tech stack (what it is built with): ${flagship.stack.groups.map((g) => `${g.label}: ${g.items.join(", ")}`).join("; ")}.`,
      flagship.stack.aws.length > 0 ? `Hosted on AWS: ${flagship.stack.aws.join(", ")}.` : null,
      `Source code: ${PRIVATE_NOTICE.toLowerCase()}. The case study shows screenshots and recordings of the real app (${REAL_APP.toLowerCase()}).`,
    ),
    source: `${flagship.name} — flagship case study overview`,
    kind: "project",
    links: [caseStudyLink(flagship.slug, flagship.name)],
    projects: [flagship.slug],
  };
}

/** One section of a flagship case study, cited at its anchor on the page. */
function flagshipSection(flagship: Flagship, key: string, heading: string, anchor: string, body: string): Passage {
  return {
    id: `cs-${flagship.slug}-${key}`,
    text: `${flagship.name} — ${heading}\n${body}`,
    source: `${flagship.name} case study — ${heading}`,
    kind: "case-study",
    links: [caseStudyLink(flagship.slug, flagship.name, anchor)],
    projects: [flagship.slug],
  };
}

/** A sketch in words: each zone with its parts, and what crosses between them. */
function sketchInWords(sketch: Flagship["sketch"]): string {
  const zones = sketch.zones.map((zone) => `${zone.label} (${zone.nodes.join(" → ")})`);
  const crossings = sketch.crossings.map((c) => `${FLAGSHIP_LABELS.crossingPrefix} ${c.label}.`);
  return lines(`${sketch.title}: ${zones.join("; ")}.`, ...crossings, ...(sketch.notes ?? []));
}

/** Every section of a flagship case study, as the page lays it out. */
function flagshipPassages(flagship: Flagship): Passage[] {
  const L = FLAGSHIP_LABELS.sections;
  const ids = FLAGSHIP_SECTION_IDS;
  const section = (key: string, heading: string, anchor: string, body: string) =>
    flagshipSection(flagship, key, heading, anchor, body);

  return [
    flagshipOverview(flagship),
    section(
      "problem",
      `${L.problem.kicker}: who it is for, and what it has to do`,
      ids.problem,
      lines(...flagship.problem.body, `${L.problem.users}: ${flagship.problem.users.join("; ")}.`),
    ),
    section(
      "constraints",
      `${L.constraints.kicker}: what the system is not allowed to do`,
      ids.constraints,
      lines(
        ...flagship.constraints.map(
          (c) => `${sentence(c.constraint)} ${L.constraints.columns.forced}: ${sentence(c.forced)} ${L.constraints.columns.checked}: ${sentence(c.checked)}`,
        ),
        flagship.constraintsNote,
      ),
    ),
    // What he built, one passage per surface (the web platform, the
    // desktop app, the API…): each is a short list a question can find on its
    // own. His role on the whole product is in the overview.
    ...flagship.built.map((group) =>
      section(
        `built-${slugify(group.title)}`,
        `What he built: the ${group.title.toLowerCase()}, the parts he owns`,
        ids.problem,
        `${group.items.map(sentence).join(" ")}`,
      ),
    ),
    section(
      "architecture",
      `${L.architecture.kicker}: what runs where, and what crosses which boundary`,
      ids.architecture,
      lines(
        ...[flagship.sketch, ...flagship.moreSketches].map(sketchInWords),
        ...flagship.boundary.map(
          (row) => `${row.data}: ${L.architecture.direction[row.direction].toLowerCase()}, ${row.path}. ${sentence(row.rule)}`,
        ),
      ),
    ),
    section(
      "how-it-works",
      `${L.how.kicker}: one run, step by step`,
      ids.how,
      flagship.trace.map((step, i) => `${i + 1}. ${sentence(step.title)} ${step.body}`).join("\n"),
    ),
    section(
      "deployment",
      `${L.deployment.kicker}: where it runs, how it ships, and the AWS services it is hosted on`,
      ids.deployment,
      lines(
        ...flagship.deployment.map((card) => `${card.title}: ${card.body}`),
        flagship.stack.aws.length > 0 ? `${L.architecture.aws}: ${flagship.stack.aws.join(", ")}.` : null,
      ),
    ),
    // A product with no incident on record says so, cited at its decisions:
    // asked "what broke?" on its page, the answer is "nothing is recorded",
    // never another product's incident.
    ...(flagship.incidents.length === 0
      ? [
          section(
            "what-broke-none",
            `${L.broke.kicker}: nothing on record for ${flagship.name}`,
            ids.decisions,
            `What broke in ${flagship.name}: no incident is on record, so its case study tells none rather than invent one. What changed, and why, is in its key decisions and their tradeoffs.`,
          ),
        ]
      : []),
    ...flagship.incidents.map((incident) =>
      section(
        `what-broke-${incident.id}`,
        `${L.broke.kicker}: ${incident.title}`,
        ids.broke,
        lines(
          `${L.broke.fields.broke}: ${incident.broke}`,
          `${L.broke.fields.cause}: ${incident.cause}`,
          `${L.broke.fields.change}: ${incident.change}`,
          `${L.broke.fields.guard}: ${incident.guard}`,
        ),
      ),
    ),
    section(
      "decisions",
      `${L.decisions.kicker}: the key decisions and what they cost`,
      ids.decisions,
      flagship.decisions
        .map(
          (d) =>
            `${sentence(d.choice)} ${L.decisions.fields.instead}: ${sentence(d.instead)} ${L.decisions.fields.reason}: ${sentence(d.reason)} ${L.decisions.fields.tradeoff}: ${sentence(d.tradeoff)}`,
        )
        .join("\n"),
    ),
    section(
      "verification",
      `${L.verification.kicker}: how it is tested and checked, and what is not measured`,
      ids.verification,
      lines(
        ...flagship.verification.suites.map((s) => `${s.value} ${s.label}. ${s.method}`),
        `${L.verification.checks}: ${flagship.verification.checks.map(clause).join("; ")}.`,
        `${L.verification.notMeasured}: ${flagship.verification.notMeasured.join("; ")}. ${L.verification.notMeasuredLead}`,
      ),
    ),
    section(
      "outcome",
      `${L.outcome.kicker}: what the record shows, and what it doesn't`,
      ids.outcome,
      lines(
        `${L.outcome.proves}: ${flagship.outcome.proves.map(clause).join("; ")}.`,
        `${L.outcome.notShown}: ${flagship.outcome.notShown.join("; ")}.`,
      ),
    ),
    section(
      "tour",
      `${L.tour.kicker} and ${L.recordings.kicker.toLowerCase()}: the real app on dummy data`,
      ids.tour,
      lines(
        // Screens and recordings by what they show. Their captions are left
        // out: they describe one run on dummy data, not the product's figures.
        ...flagship.gallery.map((tab) => `${tab.label} screens: ${tab.shots.map((shot) => shot.title).join("; ")}.`),
        ...flagship.recordings.map((recording) => `Recording, ${recording.title}: ${recording.summary}`),
        `“${FLAGSHIP_LABELS.cta.watch}” on the case study plays a recording.`,
        `Every capture is labelled “${REAL_APP}”.`,
      ),
    ),
    section(
      "walkthrough",
      `${L.walkthrough.kicker}: ${L.walkthrough.title.toLowerCase()}`,
      ids.walkthrough,
      lines(
        `${L.walkthrough.lead} ${PRIVATE_NOTICE}.`,
        `${L.walkthrough.covers}: ${WALKTHROUGH.covers.join("; ")}.`,
        `${L.walkthrough.staysPrivate}: ${WALKTHROUGH.staysPrivate.join("; ")}.`,
      ),
    ),
    ...flagship.highlights.map((h) =>
      // The title is the point ("Answers that cite the page"), so the body
      // opens with it: a verbatim fallback drops the title line.
      section(`highlight-${h.id}`, `${L.highlights.kicker}: ${h.title}`, ids.highlights, `${sentence(h.title)} ${h.body}`),
    ),
    ...flagship.excerpts.map((excerpt) =>
      section(
        `code-${excerpt.id}`,
        `${L.code.kicker}: ${excerpt.title}`,
        ids.code,
        lines(`${sentence(excerpt.title)} ${excerpt.story}`),
      ),
    ),
  ];
}

/**
 * One overview per public project, from the registry that renders /work and
 * the résumé entry for the same project. Figures stay with the evaluation
 * registry: the résumé's metric line is deliberately not copied here, so a
 * number has one source in the index as it has on the site.
 */
function projectPassages(): Passage[] {
  return projects.map((project) => {
    const entry = resume.projects.find((p) => p.name === project.title);
    const metrics = project.metrics.map((m) => `${m.label}: ${m.value} (${m.method})`);
    // A demo link claims no uptime: the hosting can sleep (PROJECT_LINKS), and a
    // demo that is down has no link at all, only its source and, if the project
    // has one, its recording.
    const demo = project.links.live
      ? `Live demo: ${project.links.live} — a deployed demo on ${PROJECT_LINKS.captionWake}.`
      : project.status === "deployed-demo"
        ? `Live demo: none published while the hosted demo is offline${project.recording ? "; the case study has a recorded product tour" : ""}.`
        : project.status === "archived"
          ? `Live demo: none. The project is archived: its source and case study stay public, and it is no longer maintained${project.recording ? "; the case study has a recorded product tour" : ""}.`
          : null;
    return {
      id: `project-${project.slug}`,
      text: lines(
        `${project.title} — project overview: what it is, its stack, status, demo and source code`,
        `${project.title}: ${project.card.definition}`,
        project.summary,
        entry ? `In short: ${entry.tagline}` : null,
        `Category: ${project.card.category}.`,
        `Key systems: ${project.systems.join(", ")}.`,
        entry ? `Tech stack: ${entry.stack}.` : null,
        metrics.length > 0 ? `Measured: ${metrics.join("; ")}.` : null,
        `Role: ${project.role}. Timeline: ${project.timeline}. Status: ${PROJECT_STATUS_LABEL[project.status]}.`,
        demo,
        project.links.repo ? `Source code (public): ${project.links.repo}.` : null,
      ),
      source: `${project.title} — project overview`,
      kind: "project" as const,
      links: [caseStudyLink(project.slug, project.title)],
      projects: [project.slug],
    };
  });
}

/** Public case-study write-ups (content/projects/<slug>.mdx), one passage per `##` section. */
function caseStudyPassages(): Passage[] {
  const passages: Passage[] = [];
  for (const project of projects) {
    let source: string;
    try {
      source = lf(readFileSync(path.join(PROJECTS_DIR, `${project.slug}.mdx`), "utf8"));
    } catch {
      console.warn(`[assistant] content/projects/${project.slug}.mdx is not readable; its case study is not searchable`);
      continue; // the project still has its overview passage
    }
    for (const section of sectionsOf(bodyOf(source))) {
      if (!section.heading) continue; // the write-ups start at their first heading
      const clean = stripMarkdown(section.body);
      if (!clean) continue;
      passages.push({
        id: `cs-${project.slug}-${slugify(section.heading)}`,
        // Prefix with project + heading so those terms weigh in retrieval.
        text: `${project.title} — ${section.heading}\n${clean}`,
        source: `${project.title} case study — ${section.heading}`,
        kind: "case-study",
        links: [caseStudyLink(project.slug, project.title)],
        projects: [project.slug],
      });
    }
  }
  return passages;
}

/**
 * Everything he has shipped, in one place — the passage that answers "What
 * has he shipped?", which no single case study can. The flagships lead, with
 * their usage in the approved wording; then the public projects.
 */
function workIndexPassage(): Passage {
  const title = "Work — what he has shipped in production: his flagship products and his public AI projects";
  return {
    id: "work-index",
    text: lines(
      title,
      `Flagship products, built at ${EMPLOYER}, where he works:`,
      ...flagships.map((f) => `- ${f.name}: ${clause(f.definition)}. In use: ${usageOf(f)}.`),
      "Public AI projects, each with a case study and public source code:",
      ...projects.map((p) => `- ${p.title}: ${p.card.definition}`),
      `The public projects run as deployed demos on ${PROJECT_LINKS.captionWake}; a demo that is offline shows its source, and its recording where it has one, instead of a link.`,
    ),
    searchText: `${title}: everything he has built, shipped and delivered in production.`,
    source: "Work — flagship products and public projects",
    kind: "work-index",
    links: mergeLinks(
      flagships.map((f) => caseStudyLink(f.slug, f.name)),
      [PAGE.work],
    ),
    projects: [],
  };
}

/** The job the résumé lists as current, if any. */
const currentRole = resume.experience.find((exp) => /present/i.test(exp.period));

/** The roles the hiring page lists, by title: "Applied AI Engineer; …". */
const OPEN_ROLES = hirePage.roles.items.map((role) => role.title);

/** Where he works from, in the hiring page's words. */
const LOGISTICS = hirePage.perks.items.find((item) => item.icon === "route")?.body ?? null;

/** The hiring page's notice term for its full-time roles, from the one availability source (STATUS). */
const NOTICE_TERM = `Notice period: ${STATUS.noticePeriod}`;

/** The notice period, stated once, in the words /llms.txt uses. */
const NOTICE_LINE = `Notice period for full-time roles: ${STATUS.noticePeriod}`;

/**
 * What the site says about the work he is open to, in its own words: what an
 * answer to a hiring question the site does not cover can still say. Its
 * source is the hiring passage (HIRING_PASSAGE), which cites the same pages.
 */
export const HIRING_FACTS = lines(`He is open to: ${OPEN_ROLES.join("; ")}.`, LOGISTICS).replace(/\n/g, " ");

/** The id of the passage HIRING_FACTS is read from: the roles he is open to. */
export const HIRING_PASSAGE = "hire-roles";

/**
 * Who Mubin is, compactly: role, experience, the flagship work with its usage,
 * the public projects, what he is open to, where he is and how to reach him.
 *
 * It is also the background of every live answer (see `PROFILE`), so a
 * generic question never dead-ends: everything here is read from the content
 * modules, and nothing is written for the assistant alone.
 */
function profilePassage(): Passage {
  const before = resume.experience.filter((exp) => exp !== currentRole);
  return {
    id: "profile-summary",
    text: lines(
      `About ${SITE.name} — who he is, what he does, where he works, what he has shipped and how to reach him`,
      // The brand role and the employment title are different facts (ADR-015):
      // the first names his discipline, the second is his job title.
      `${SITE.name} — ${firstSentence(resume.summary)}`,
      currentRole
        ? `He works as ${currentRole.role} at ${currentRole.org} (${currentRole.period}); that is his job title.`
        : null,
      before.length > 0 ? `Before that: ${before.map((exp) => `${exp.role} at ${exp.org} (${exp.period})`).join("; ")}.` : null,
      `Flagship work at ${EMPLOYER}: ${flagships.map((f) => `${f.name} — ${clause(f.definition)} (${usageOf(f)})`).join("; ")}.`,
      ...flagships.map((f) => `His role on ${f.name}, in his words: “${firstSentence(f.credit.role)}”`),
      `How he builds, in his words: “${AGENT_DIRECTION}”`,
      flagships.every((f) => f.stack.aws.length > 0) ? "Both flagship products are hosted on AWS." : null,
      `Public AI projects, each with a case study and public source: ${projects.map((p) => p.title).join(", ")}.`,
      `Open to: ${OPEN_ROLES.join("; ")}. ${NOTICE_LINE}.`,
      LOGISTICS,
      `Based in ${SITE.location} (IST, UTC+5:30). Email: ${SITE.email}.`,
      `Education: ${resume.education.degree}, ${resume.education.school} (${resume.education.year}).`,
    ),
    source: "About — profile: who he is, his work and how to reach him",
    kind: "profile",
    links: [PAGE.about],
    projects: [],
  };
}

/** The roles he is open to, and on what terms — the hiring page's "Open to" list. */
function hireRolesPassage(): Passage {
  return {
    id: HIRING_PASSAGE,
    text: lines(
      "Hiring — the roles he is open to, whether he is available, his notice period and when he can join, and where he can work",
      `Availability: ${STATUS.text}.`,
      `${NOTICE_LINE}.`,
      // The full-time roles' terms repeat the notice period; the line above states it once.
      `Roles he is open to: ${hirePage.roles.items.map((role) => `${role.title} (${role.terms.filter((term) => term !== NOTICE_TERM).join(", ")})`).join("; ")}.`,
      LOGISTICS ? `Where he works: ${LOGISTICS}` : null,
      `In his words: “${hirePage.letter.close}”`,
      `${hirePage.roles.note.strong} ${hirePage.roles.note.body}`,
    ),
    source: "Hiring — roles he is open to",
    kind: "hire",
    links: [PAGE.hire, PAGE.contact],
    projects: [],
  };
}

/** How he works — the hiring page's letter and its "Working with me" grid. */
function hireWorkingPassage(): Passage {
  const stats = hirePage.glance.stats.map((s) => `${s.label}: ${s.value}`);
  return {
    id: "hire-working",
    text: lines(
      "Hiring — how he works, and what working with him looks like",
      `From his note to hiring teams, in his words: “${[
        hirePage.letter.intro,
        ...hirePage.letter.qa.map((pair) => `${pair.q} ${pair.a}`),
        hirePage.letter.strong,
        hirePage.letter.agents,
      ].join(" ")}”`,
      `${hirePage.perks.label}: ${hirePage.perks.items.map((item) => `${item.title} — ${clause(item.body)}`).join("; ")}.`,
      `${hirePage.glance.label}: ${stats.join("; ")}.`,
    ),
    source: "Hiring — how he works",
    kind: "hire",
    links: [PAGE.hire],
    projects: [],
  };
}

/** How to reach him and on what terms — the contact page, with the links every page's chrome shows. */
function contactPassage(): Passage {
  const [beforeEmail, afterEmail] = contactPage.freelance.body;
  return {
    id: "contact",
    text: lines(
      `Contact — how to reach ${SITE.name}: his email, booking a call, and his GitHub, LinkedIn and Hugging Face profiles`,
      `Availability: ${STATUS.text}.`,
      `Email: ${SITE.email}. In his words: “${FOOTER.invite}”`,
      // The contact page's hiring line ends with the notice period, from STATUS.
      // The title leaves it to the hiring passage, which states it on its
      // second line: a notice question then leads with that passage (and its
      // fallback) and still cites this page second.
      `${contactPage.hiring.title}: ${contactPage.hiring.body}`,
      INTEGRATIONS.calUrl
        ? `${contactPage.freelance.title}: ${beforeEmail} ${SITE.email} ${afterEmail} Book a call: ${INTEGRATIONS.calUrl}.`
        : null,
      `Location: ${SITE.location}, on IST (UTC+5:30).`,
      `Profiles: GitHub ${SITE.socials.github} · LinkedIn ${SITE.socials.linkedin} · Hugging Face ${SITE.socials.huggingface}.`,
    ),
    source: "Contact — availability, email and booking",
    kind: "contact",
    links: [PAGE.contact],
    projects: [],
  };
}

/** The résumé: one passage per role, plus education and the PDF. */
function resumePassages(): Passage[] {
  const roles = resume.experience.map((exp) => ({
    id: `resume-${slugify(exp.org)}`,
    text: lines(
      `Work experience — ${exp.role} at ${exp.org}${exp === currentRole ? " (current job)" : ""}`,
      `${exp.role} at ${exp.org} (${exp.period}), ${exp.place}.`,
      ...exp.points,
    ),
    source: `Résumé — ${exp.org} (${exp.role})`,
    kind: "resume" as const,
    links: [PAGE.resume],
    projects: projectsNamedIn(exp.points.join(" ")),
  }));
  const { degree, school, year } = resume.education;
  return [
    ...roles,
    {
      id: "resume-education",
      text: `Education — where he studied: degree, university and year\n${degree}, ${school} (${year}). Education and academic background.`,
      source: "Résumé — Education",
      kind: "resume",
      links: [PAGE.resume],
      projects: [],
    },
    {
      id: "resume-document",
      text: lines(
        "Résumé — his CV: the résumé on the site and its PDF download",
        `${SITE.name}'s résumé is on the site (${PAGE.resume.href}), with a PDF download (${resume.pdf}).`,
        resume.summary,
      ),
      source: "Résumé — the page and the PDF",
      kind: "resume",
      links: [PAGE.resume],
      projects: [],
    },
  ];
}

/** Skills, one passage per résumé group — the list /skills and the PDF show. */
function skillPassages(): Passage[] {
  return resume.skills.map((group) => ({
    id: `skills-${slugify(group.group)}`,
    text: `Skills — ${group.group}\n${group.group} skills and tools: ${group.items}.`,
    source: `Skills — ${group.group}`,
    kind: "skills" as const,
    links: [PAGE.skills],
    projects: [],
  }));
}

/**
 * The AWS services his products run on — the evidence behind "AWS" on the
 * skills list, read from each flagship's stack.
 */
function awsPassage(): Passage {
  const hosted = flagships.filter((f) => f.stack.aws.length > 0);
  return {
    id: "skills-aws",
    text: lines(
      "Skills — AWS: his AWS cloud experience, and the AWS services his products are hosted on",
      ...hosted.map((f) => `${f.name} is hosted on AWS: ${f.stack.aws.join(", ")}.`),
    ),
    source: "Skills — AWS, from the flagship case studies",
    kind: "skills",
    links: mergeLinks(
      hosted.map((f) => caseStudyLink(f.slug, f.name, FLAGSHIP_SECTION_IDS.deployment)),
      [PAGE.skills],
    ),
    projects: [],
  };
}

/** The project slug an evaluation row's `system` names, if it is one of ours. */
const projectSlugFor = (system: string): string | undefined =>
  PROJECT_NAMES.find((p) => p.title === system)?.slug;

/**
 * One passage per evaluation-registry row, as /evals presents it.
 *
 * Only a complete row states a result. A retired row is presented as what it
 * is — a withdrawn result, with the date, the reason and the audit — and never
 * with a figure: the registry's schema guarantees a retired row carries none.
 */
function evaluationPassage(row: EvalRow): Passage {
  const anchor = evalAnchor(row);
  const slug = projectSlugFor(row.system);
  const title = `Evaluation — ${row.system}: ${row.metric} on ${row.benchmark}`;
  // The registry row first; then the page it links, and the project's case
  // study, which shows the same result under "Results, with methods".
  const onSite = row.link?.startsWith("/") ? [{ label: row.system, href: row.link }] : [];
  const caseStudy = slug ? [caseStudyLink(slug, row.system)] : [];
  const links = mergeLinks([{ label: PAGE.evals.label, href: `/evals#${anchor}` }], onSite, caseStudy);
  const reference = row.link && /^https?:\/\//.test(row.link) ? `Method and evidence: ${row.link}` : null;

  if (row.retired) {
    return {
      id: `eval-${anchor}`,
      text: lines(
        `${title} (retired result)`,
        // The fallback drops the title line, so the body names the run too.
        `Status: retired on ${row.retired.date}. The ${row.benchmark} result was withdrawn; its figures are not published anywhere on the site and must not be quoted.`,
        row.date ? `The run it described: ${row.date}.` : null,
        row.note ? `What it was: ${row.note}` : null,
        `Why it was retired: ${row.retired.reason}`,
        `The audit that withdrew it: ${row.retired.link}`,
      ),
      source: `Evaluation — ${row.system} · ${row.benchmark} (retired)`,
      kind: "evaluation",
      links,
      projects: slug ? [slug] : [],
      benchmark: row.benchmark,
      retired: true,
    };
  }

  const complete = row.status === "complete";
  return {
    id: `eval-${anchor}`,
    text: lines(
      title,
      // The grounded fallback serves a passage without its title line, so the
      // scope is restated here, ahead of the figure: a result is never shown
      // without what it measures ("a deterministic policy test, not model
      // accuracy") and the test set it was measured on.
      `What it measures: ${row.metric}, on ${row.benchmark}.`,
      complete
        ? `Result: ${row.result}${row.date ? ` (${row.date})` : ""}.`
        : `Status: ${row.status === "planned" ? "planned — not run yet" : "in progress — no result yet"}.`,
      row.note ? `${complete ? "Method" : "Details"}: ${row.note}` : null,
      reference,
    ),
    source: `Evaluation — ${row.system} · ${row.benchmark}${complete ? "" : ` (${row.status})`}`,
    kind: "evaluation",
    links,
    projects: slug ? [slug] : [],
    benchmark: row.benchmark,
  };
}

/**
 * How /evals reads: what the registry is for and the terms its rows use
 * ("execution accuracy", "deterministic policy test", "retired"), so an answer
 * about a result can say what kind of result it is.
 */
function evaluationGuidePassage(): Passage {
  return {
    id: "eval-guide",
    text: lines(
      `Evaluations — how he measures his work, and how to read a result`,
      evalsIntro.lede,
      ...evalsIntro.body,
      ...evalsIntro.terms.map((t) => `${t.term}: ${t.def}`),
    ),
    source: `Evaluations — ${evalsIntro.title}`,
    kind: "evaluation-guide",
    links: [PAGE.evals],
    projects: [],
  };
}

/** /about: where he has worked, the line he works by, his tools, and his three rules. */
function aboutPassages(): Passage[] {
  const summaries = resume.experience
    .map((exp) => (aboutPage.experience.summaries[exp.org] ? `${exp.org}: ${clause(aboutPage.experience.summaries[exp.org]!)}` : null))
    .filter((line): line is string => line !== null);
  return [
    {
      id: "about-page",
      text: lines(
        "About — his background: from healthcare workflows to AI products, where he has worked and the tools he ships with",
        `${aboutPage.hero.title}. In his words: “${aboutPage.hero.lead.map((part) => part.text).join("")}”`,
        summaries.length > 0 ? `${aboutPage.experience.title}: ${summaries.join("; ")}.` : null,
        // One line, as the page leads with it: the others are in the essays, which are indexed whole.
        `A line he works by, from his essay “${aboutPage.quotes[0].essay.label}”: “${aboutPage.quotes[0].text}”`,
        `${aboutPage.stack.label}: ${aboutPage.stack.items.join(", ")}.`,
      ),
      source: "About — background, experience and tools",
      kind: "profile",
      links: [PAGE.about],
      projects: [],
    },
    {
      id: "about-principles",
      text: lines(
        "About — how he approaches the work: the principles and rules he holds every project to",
        aboutPage.principles.body,
        ...home.principles.map((p) => `${p.title}: ${p.body}`),
      ),
      source: "About — how he approaches the work",
      kind: "profile",
      links: [PAGE.about],
      projects: [],
    },
  ];
}

/** What /now says he is building, exploring and reading, with the date it was last updated. */
function nowPassage(): Passage {
  const { data, body } = splitFrontmatter(lf(readFileSync(path.join(CONTENT_DIR, "now.mdx"), "utf8")), "content/now.mdx");
  const meta = NowSchema.parse(data);
  const sections = sectionsOf(body).map((s) => (s.heading ? `${s.heading}: ${stripMarkdown(s.body)}` : stripMarkdown(s.body)));
  return {
    id: "now",
    text: lines(
      `Now — what he is working on now: building, exploring and reading (updated ${meta.updated})`,
      `From his /now page, in his words: ${meta.lede}`,
      ...sections,
      meta.exploring.length > 0
        ? `Currently exploring: ${meta.exploring.map((item) => `${item.title} — ${clause(item.body)}`).join("; ")}.`
        : null,
    ),
    source: `Now — updated ${formatDate(meta.updated)}`,
    kind: "page",
    links: [PAGE.now],
    projects: [],
  };
}

/** /uses: the tools behind the public projects, and how their hosting stays free. */
function usesPassages(): Passage[] {
  return [
    ...uses.groups.map((group) => ({
      id: `uses-${slugify(group.title)}`,
      text: lines(
        `Uses — the tools he uses: ${group.title}`,
        ...group.items.map((tool) => (TOOL_NOTES[tool] ? `${tool}: ${TOOL_NOTES[tool]}` : `${tool}.`)),
      ),
      source: `Uses — ${group.title}`,
      kind: "page" as const,
      links: [PAGE.uses],
      projects: [],
    })),
    {
      id: "uses-hosting",
      text: lines("Uses — how his public projects are hosted, and what it costs", uses.intro, uses.costNote),
      source: "Uses — hosting and cost",
      kind: "page",
      links: [PAGE.uses],
      projects: [],
    },
  ];
}

/**
 * /trust: what is claimed and where to check it, including what is not
 * claimed. The evaluation rows are left out here: each is its own passage,
 * built from the registry the trust page reads them from.
 */
function trustPassage(): Passage {
  const evaluationRows = new Set(evals.map((row) => row.system));
  const claims = EVIDENCE.filter((row) => !evaluationRows.has(row.area)).map(
    (row) => `${row.area}: ${clause(row.claim)} (${row.status === "not-claimed" ? "not claimed" : row.status}).`,
  );
  return {
    id: "trust",
    text: lines(
      "Trust — the claims you can check, what is not claimed, and how quality is protected",
      TRUST_PAGE.lead,
      ...claims,
      ...trust.principles.map((p) => `${p.title}: ${p.body}`),
      ...trust.controls.map((c) => `${c.title}: ${c.items.join("; ")}.`),
    ),
    source: "Trust — claims and practices",
    kind: "page",
    links: [PAGE.trust],
    projects: [],
  };
}

/**
 * /evaluate: how to check his work with your own AI, and what that AI reads.
 * Its privacy points are left out: /privacy answers those, and one names a
 * salary, which no passage may (the assistant answers that with a fixed reply).
 */
function evaluatePassage(): Passage {
  const { hero, prompts, reads } = evaluatePage;
  return {
    id: "evaluate",
    text: lines(
      "Evaluate him with your own AI — the prompt to paste, prompts to try, and what your AI reads",
      hero.lead,
      `The prompt: ${hero.prompt}`,
      `${prompts.title}: ${prompts.items.map((prompt) => `${prompt.label} — ${prompt.ask}`).join("; ")}.`,
      `${reads.title}: ${reads.items.map((item) => `${item.title}: ${item.body}`).join(" ")}`,
    ),
    source: "Evaluate with your AI — prompts and llms.txt",
    kind: "page",
    links: [PAGE.evaluate],
    projects: [],
  };
}

/** How an essay's category reads in a source label. */
const WRITING_KIND = { essay: "Essay", guide: "Guide", note: "Note" } as const;

/** The published essays, guides and notes, read once for every passage built from them. */
const WRITING = readCollection(
  {
    label: "writing",
    list: () => readdirSync(WRITING_DIR),
    read: (file) => readFileSync(path.join(WRITING_DIR, file), "utf8"),
  },
  WritingSchema,
);
const NOTES = readCollection(
  {
    label: "notes",
    list: () => readdirSync(NOTES_DIR),
    read: (file) => readFileSync(path.join(NOTES_DIR, file), "utf8"),
  },
  NoteSchema,
);

/**
 * Everything he has published, as the /writing and /notes indexes list it — the
 * passage that answers "What has he written?", which no single essay can.
 */
function writingIndexPassage(): Passage {
  const newestFirst = <T extends { meta: { date: string } }>(entries: readonly T[]): T[] =>
    [...entries].sort((a, b) => byDateDesc(a.meta, b.meta));
  const title = "Writing — what he has written: every essay, guide and note he has published";
  return {
    id: "writing-index",
    text: lines(
      title,
      ...newestFirst(WRITING).map(
        ({ meta }) => `${WRITING_KIND[meta.category]}: "${meta.title}" (${meta.date}) — ${meta.summary}`,
      ),
      ...newestFirst(NOTES).map(({ meta }) => `Note: "${meta.title}" (${meta.date}).`),
    ),
    searchText: `${title}: his writing, blog posts and articles.`,
    source: "Writing — essays, guides and notes",
    kind: "writing-index",
    links: [PAGE.writing, PAGE.notes],
    projects: [],
  };
}

/**
 * "Essay (writing, published 2026-05-20)". Essays and notes describe a project
 * as it was on their date, and a later release can change what they describe
 * (the validator moved from sqlparse to SQLGlot), so every passage built from
 * one says when it was written.
 */
const writingTitle = (kind: string, meta: { date: string; updated?: string }): string =>
  `${kind} (writing, published ${meta.date}${meta.updated ? `, updated ${meta.updated}` : ""})`;

/** "Essay — Trust is not a safety model (May 2026)": the source the model sees, dated. */
const writingSource = (kind: string, meta: { title: string; date: string }): string =>
  `${kind} — ${meta.title} (${formatDate(meta.date)})`;

/** Published essays and guides, chunked by `##` section; the intro is its own passage. */
function writingPassages(): Passage[] {
  const passages: Passage[] = [];
  for (const { meta, body } of WRITING) {
    const kind = WRITING_KIND[meta.category];
    const link: CitationLink = { label: meta.title, href: `/writing/${meta.slug}` };
    const title = writingTitle(kind, meta);
    const source = writingSource(kind, meta);
    // Read from the whole essay: a section that does not repeat a project's
    // name is still about it.
    const named = projectsNamedIn(`${meta.title}\n${meta.summary}\n${body}`);
    for (const section of sectionsOf(body)) {
      const clean = stripMarkdown(section.body);
      if (!clean) continue;
      const heading = section.heading;
      passages.push({
        id: `writing-${meta.slug}-${heading === null ? "intro" : slugify(heading)}`,
        text:
          heading === null
            ? lines(
                `${title} — ${meta.title}`,
                meta.summary,
                clean,
                meta.topics.length > 0 ? `Topics: ${meta.topics.join(", ")}.` : null,
              )
            : `${title} — ${meta.title} — ${heading}\n${clean}`,
        source: heading === null ? source : `${source} — ${heading}`,
        kind: "writing",
        links: [link],
        projects: named,
      });
    }
  }
  return passages;
}

/** Published notes — each is short, so each is one passage. */
function notePassages(): Passage[] {
  return NOTES.map(({ meta, body }) => ({
    id: `note-${meta.slug}`,
    text: lines(
      `${writingTitle("Note", meta)} — ${meta.title}`,
      stripMarkdown(body),
      `Tags: ${meta.tags.join(", ")}.`,
      meta.source ? `Reference: ${meta.source}` : null,
    ),
    source: writingSource("Note", meta),
    kind: "note" as const,
    links: [{ label: meta.title, href: `/notes/${meta.slug}` }],
    projects: projectsNamedIn(`${meta.title}\n${body}`),
  }));
}

/** Build every passage, in a stable order. */
export function buildCorpus(): Passage[] {
  return [
    ...faqPassages(),
    workIndexPassage(),
    ...flagships.flatMap(flagshipPassages),
    ...projectPassages(),
    ...caseStudyPassages(),
    profilePassage(),
    hireRolesPassage(),
    hireWorkingPassage(),
    contactPassage(),
    ...resumePassages(),
    ...skillPassages(),
    awsPassage(),
    ...aboutPassages(),
    nowPassage(),
    ...usesPassages(),
    trustPassage(),
    evaluatePassage(),
    evaluationGuidePassage(),
    ...evals.map(evaluationPassage),
    writingIndexPassage(),
    ...writingPassages(),
    ...notePassages(),
  ];
}
