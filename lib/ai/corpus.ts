// -----------------------------------------------------------------------------
// The assistant's corpus: the published content of this site, as passages.
//
// Built once, at module load, from the same sources the pages render — the
// project registry, the résumé, the evaluation registry, the site config, the
// essays and notes — so a fact changed on a page changes in the assistant's
// index with it. Only two sources are written for the assistant: the FAQ
// (content/faq.json) and the case-study write-ups (content/projects/*.mdx).
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
import profileData from "@/content/profile.json";
import { resume } from "@/content/resume";
import { projects } from "@/content/projects";
import { evals, evalAnchor, evalsIntro } from "@/content/evals";
import { PROJECT_LINKS, PROJECT_STATUS_LABEL } from "@/content/article";
import { NoteSchema, WritingSchema, type EvalRow } from "@/content/schema";
import { FOOTER, SITE, STATUS } from "@/config/site";
import { CONTENT_SLUG } from "@/lib/content-slug";
import { byDateDesc } from "@/lib/feed";
import type { CitationLink } from "./chat-contract";
import { citationLinks, mergeLinks } from "./citation-links";

/** What a passage was built from. */
export type PassageKind =
  | "faq"
  | "project"
  | "case-study"
  | "profile"
  | "contact"
  | "resume"
  | "skills"
  | "evaluation"
  | "evaluation-guide"
  | "writing"
  | "writing-index"
  | "note";

/** A single retrievable unit of real site content. */
export type Passage = {
  /** Stable id, e.g. "faq-2" or "cs-dbwhisper-architecture". */
  id: string;
  /**
   * The retrievable text. Its first line is a title (e.g. "DBWhisper —
   * Architecture"); the grounded fallback shows the rest of it verbatim.
   */
  text: string;
  /**
   * What the index matches, when it is not `text`. A listing is found by what
   * it is ("what he has written"), not by the titles it lists — otherwise it
   * would outrank every essay it names.
   */
  searchText?: string;
  /** Human-readable origin, e.g. "DBWhisper case study — Architecture". */
  source: string;
  kind: PassageKind;
  /** Site pages a reader can open to check this passage. */
  links: readonly CitationLink[];
  /**
   * Slugs of the projects this passage is the site's own record of: the
   * overview, a case-study section, an evaluation row, or an FAQ answer whose
   * source names the project. Essays and notes discuss projects too, but as
   * commentary, so they carry none — a question about a project is answered
   * from its record first.
   */
  projects: readonly string[];
  /** True for an evaluation result the registry has withdrawn. */
  retired?: true;
};

/** A project as a question can name it. */
export type ProjectName = { slug: string; title: string };

/** Every project, by the title a visitor would type. */
export const PROJECT_NAMES: readonly ProjectName[] = projects.map(({ slug, title }) => ({ slug, title }));

// Literal paths, one per collection, and each read written out at its call site
// as `readFileSync(path.join(<DIR>, …))`: Next's output-file tracer follows a
// path it can read statically, which is what puts these files into the
// /api/chat bundle on Vercel. A read through a helper taking the path as a
// parameter is invisible to it.
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
 * `key: ["a", "b"]`, and block lists — and throws on anything else, so an
 * unusual file fails the test suite instead of silently leaving the index. The
 * result is then validated with the same Zod schema the pages use.
 */
export function splitFrontmatter(source: string, file: string): { data: Record<string, unknown>; body: string } {
  const match = /^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(source);
  if (!match) return { data: {}, body: source };
  const data: Record<string, unknown> = {};
  let list: unknown[] | null = null;
  for (const line of match[1]!.split("\n")) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const item = /^\s+-\s+(.*)$/.exec(line);
    if (item && list) {
      list.push(frontmatterScalar(item[1]!));
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

/** Projects named in a piece of text, by title ("LLM Studio", "TradePulse"). */
function projectsNamedIn(text: string): string[] {
  const lower = text.toLowerCase();
  return PROJECT_NAMES.filter((p) => lower.includes(p.title.toLowerCase())).map((p) => p.slug);
}

// ---------------------------------------------------------------------------
// Passages, one builder per source
// ---------------------------------------------------------------------------

/** The FAQ — the highest-signal source. One passage per question. */
function faqPassages(): Passage[] {
  return faqData.faq.map((item, i) => ({
    id: `faq-${i}`,
    text: `${item.question}\n${item.answer}`,
    // The FAQ already carries a precise, human-readable source string.
    source: `FAQ — ${item.source}`,
    kind: "faq" as const,
    links: citationLinks(item.source),
    projects: projectsNamedIn(item.source),
  }));
}

/** The project page's own link. */
const projectLink = (slug: string, title: string): CitationLink => ({ label: title, href: `/work/${slug}` });

/**
 * One overview per project, from the registry that renders /work and the
 * résumé entry for the same project. Figures stay with the evaluation
 * registry: the résumé's metric line is deliberately not copied here, so a
 * number has one source in the index as it has on the site.
 */
function projectPassages(): Passage[] {
  return projects.map((project) => {
    const entry = resume.projects.find((p) => p.name === project.title);
    const metrics = project.metrics.map((m) => `${m.label}: ${m.value} (${m.method})`);
    // A demo link claims no uptime: the hosting can sleep (PROJECT_LINKS), and a
    // demo that is down has no link at all, only its recording and source.
    const demo = project.links.live
      ? `Live demo: ${project.links.live} — a deployed demo on ${PROJECT_LINKS.captionWake}.`
      : project.status === "deployed-demo"
        ? "Live demo: none published while the hosted demo is offline; the case study has a recorded product tour."
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
      links: [projectLink(project.slug, project.title)],
      projects: [project.slug],
    };
  });
}

/** Case-study write-ups (content/projects/<slug>.mdx), one passage per `##` section. */
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
        links: [projectLink(project.slug, project.title)],
        projects: [project.slug],
      });
    }
  }
  return passages;
}

/** The job the résumé lists as current, if any. */
const currentRole = resume.experience.find((exp) => /present/i.test(exp.period));

/** Who Mubin is: role, focus, summary, location, roles and education. */
function profilePassage(): Passage {
  const roles = resume.experience.map((exp) => `${exp.role} at ${exp.org} (${exp.period})`);
  return {
    id: "profile-summary",
    text: lines(
      `About ${SITE.name} — who he is, what he does, where he works and where he is based`,
      // The brand role and the employment title are different facts (ADR-015):
      // the first names his discipline, the second is his job title.
      `${SITE.name} — ${SITE.role}.`,
      currentRole
        ? `He works as ${currentRole.role} at ${currentRole.org} (${currentRole.period}); that is his job title.`
        : null,
      `Focus: ${profileData.focus}.`,
      profileData.tagline,
      profileData.ethos,
      resume.summary,
      `Experience: ${roles.join("; ")}.`,
      `Education: ${resume.education.degree}, ${resume.education.school} (${resume.education.year}).`,
      `Based in ${SITE.location}.`,
    ),
    source: "Profile — summary & ethos",
    kind: "profile",
    links: [{ label: "About Mubin", href: "/about" }],
    projects: [],
  };
}

/** How to reach him and what he is open to — the facts every page's chrome shows. */
function contactPassage(): Passage {
  return {
    id: "contact",
    text: lines(
      `Contact and availability — how to reach ${SITE.name}: his email, his GitHub, LinkedIn and Hugging Face profiles, hiring him, and whether he is open to work`,
      `Availability: ${STATUS.text}.`,
      `Email: ${SITE.email}. In his words: "${FOOTER.invite}"`,
      "The Contact page has his email address and the ways to start a conversation.",
      `Location: ${SITE.location}.`,
      `Profiles: GitHub ${SITE.socials.github} · LinkedIn ${SITE.socials.linkedin} · Hugging Face ${SITE.socials.huggingface}.`,
      "His résumé is on the site, with a PDF download.",
    ),
    source: "Contact — availability and email",
    kind: "contact",
    links: [
      { label: "Contact", href: STATUS.href },
      { label: "Résumé", href: "/resume" },
    ],
    projects: [],
  };
}

/** The résumé: one passage per role, plus education. */
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
    links: [{ label: "Résumé", href: "/resume" }],
    projects: [],
  }));
  const { degree, school, year } = resume.education;
  return [
    ...roles,
    {
      id: "resume-education",
      text: `Education — where he studied: degree, university and year\n${degree}, ${school} (${year}). Education and academic background.`,
      source: "Résumé — Education",
      kind: "resume",
      links: [{ label: "Résumé", href: "/resume" }],
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
    links: [{ label: "Skills", href: "/skills" }],
    projects: [],
  }));
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
  const onSite = row.link?.startsWith("/") ? [{ label: row.system, href: row.link }] : [];
  const links = mergeLinks([{ label: "Evals", href: `/evals#${anchor}` }], onSite);
  const reference = row.link && /^https?:\/\//.test(row.link) ? `Method and evidence: ${row.link}` : null;

  if (row.retired) {
    return {
      id: `eval-${anchor}`,
      text: lines(
        `${title} (retired result)`,
        `Status: retired on ${row.retired.date}. This result was withdrawn; its figures are not published anywhere on the site and must not be quoted.`,
        row.date ? `The run it described: ${row.date}.` : null,
        row.note ? `What it was: ${row.note}` : null,
        `Why it was retired: ${row.retired.reason}`,
        `The audit that withdrew it: ${row.retired.link}`,
      ),
      source: `Evaluation — ${row.system} · ${row.benchmark} (retired)`,
      kind: "evaluation",
      links,
      projects: slug ? [slug] : [],
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
      // accuracy").
      `What it measures: ${row.metric}.`,
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
    links: [{ label: "Evals", href: "/evals" }],
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
    links: [
      { label: "Writing", href: "/writing" },
      { label: "Notes", href: "/notes" },
    ],
    projects: [],
  };
}

/** Published essays and guides, chunked by `##` section; the intro is its own passage. */
function writingPassages(): Passage[] {
  const passages: Passage[] = [];
  for (const { meta, body } of WRITING) {
    const kind = WRITING_KIND[meta.category];
    const link: CitationLink = { label: meta.title, href: `/writing/${meta.slug}` };
    for (const section of sectionsOf(body)) {
      const clean = stripMarkdown(section.body);
      if (!clean) continue;
      const heading = section.heading;
      passages.push({
        id: `writing-${meta.slug}-${heading === null ? "intro" : slugify(heading)}`,
        text:
          heading === null
            ? lines(
                `${kind} (writing) — ${meta.title}`,
                meta.summary,
                clean,
                meta.topics.length > 0 ? `Topics: ${meta.topics.join(", ")}.` : null,
              )
            : `${meta.title} — ${heading}\n${clean}`,
        source: heading === null ? `${kind} — ${meta.title}` : `${kind} — ${meta.title} — ${heading}`,
        kind: "writing",
        links: [link],
        projects: [],
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
      `Note (writing) — ${meta.title}`,
      stripMarkdown(body),
      `Tags: ${meta.tags.join(", ")}.`,
      meta.source ? `Reference: ${meta.source}` : null,
    ),
    source: `Note — ${meta.title}`,
    kind: "note" as const,
    links: [{ label: meta.title, href: `/notes/${meta.slug}` }],
    projects: [],
  }));
}

/** Build every passage, in a stable order. */
export function buildCorpus(): Passage[] {
  return [
    ...faqPassages(),
    ...projectPassages(),
    ...caseStudyPassages(),
    profilePassage(),
    contactPassage(),
    ...resumePassages(),
    ...skillPassages(),
    evaluationGuidePassage(),
    ...evals.map(evaluationPassage),
    writingIndexPassage(),
    ...writingPassages(),
    ...notePassages(),
  ];
}
