/**
 * resume-document — the résumé as one standalone HTML document: the exact
 * input `build-resume-pdf.mts` prints to /public/Mubin_Attar_Resume.pdf.
 *
 * It is kept apart from the printer so `test/resume-pdf.test.mts` can render
 * the same document without a browser and prove the committed PDF is current:
 * the printer records the document's hash in `resume-pdf.lock.json`, and the
 * test fails when content/resume.ts, config/site.ts, the flagship records or
 * the eval registry has changed since. No fabricated content — every line comes
 * from the résumé data, and every figure arrives with its scope, date and
 * method link.
 *
 * Written for its first two readers:
 * - Résumé-screening software (ATS). One column of real text in a standard
 *   font; the five standard section headings as plain words, because
 *   letter-spacing or a capitals transform makes extractors split a heading
 *   into single letters; no tables, grids, icons or images of text; one date
 *   format; contact details in the body, not a page header.
 * - A recruiter's skim and an engineer's read. Name, role and contact first,
 *   the flagship products in the summary and the first bullets, each linked to
 *   its case study, and every figure beside its method.
 *
 * The phone number is published in the PDF and nowhere else (owner, 17 Nov
 * 2026): the PDF is a document a recruiter chooses to download, while the
 * site's pages, llms.txt and JSON-LD are read by anything that crawls them.
 * This module holds the number only in parts (`PHONE_PARTS`), so no text file
 * in this public repository carries it whole, which is what scrapers of source
 * code match. `test/resume-phone.test.mts` keeps it that way.
 *
 * The palette literals below exist because a standalone print document cannot
 * read the site's CSS variables; they mirror the light tokens
 * (design-system.md §2): ink, ink-secondary, ink-tertiary, border-strong and
 * accent, the accent kept to links (§11.2).
 */
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { resume } from "../content/resume.ts";
import { flagshipHref, flagships } from "../content/flagship/index.ts";
import { SITE, STATUS } from "../config/site.ts";

/** Where the printer writes the PDF, and the lock that records its input. */
export const RESUME_PDF_PATH = fileURLToPath(new URL("../public/Mubin_Attar_Resume.pdf", import.meta.url));
export const RESUME_PDF_LOCK_PATH = fileURLToPath(new URL("./resume-pdf.lock.json", import.meta.url));

/** The lock's shape: the document the PDF was printed from, and the PDF itself. */
export type ResumePdfLock = {
  generatedBy: string;
  htmlSha256: string;
  pdfSha256: string;
};

/** A4's width, which the content width is derived from. */
const A4_WIDTH_MM = 210;
/**
 * The page margins, in millimetres. Never below 12 (top and bottom) and 13
 * (sides); test/resume-pdf.test.mts holds those floors too.
 */
const MARGIN_MM = { block: 14, inline: 15 } as const;

/**
 * The printed page: A4 at these margins. `contentWidth` is the width the text
 * sets in (A4 less both inline margins), which the printer uses to measure the
 * lines exactly as they print.
 */
export const PAGE = {
  size: "A4",
  marginBlockMm: MARGIN_MM.block,
  marginInlineMm: MARGIN_MM.inline,
  contentWidth: `${A4_WIDTH_MM - 2 * MARGIN_MM.inline}mm`,
} as const;

/**
 * The type scale, in points, and the leading. A résumé is read at the size it
 * prints, so the page is fitted by cutting words, never by shrinking type:
 * body text stays at 10 pt or more, the smallest text at 9 pt or more, and
 * test/resume-pdf.test.mts holds these floors.
 */
export const TYPE = { name: 22, role: 12, section: 12, entry: 10.5, text: 10, small: 9, leading: 1.35 } as const;

/** The phone number's parts: country code, then the two halves of the national number. */
const PHONE_PARTS = ["+91", "70387", "70374"] as const;

/** The phone number: whole in the PDF only (see the module comment). */
export const PHONE = {
  display: PHONE_PARTS.join(" "),
  href: `tel:${PHONE_PARTS.join("")}`,
} as const;

/**
 * The PDF's document properties: what a PDF reader's Properties panel, a file
 * browser and a résumé database show. Every keyword is a term the résumé
 * itself uses (test/resume-pdf.test.mts checks), so the metadata adds no claim.
 */
export const RESUME_PDF_INFO = {
  title: `${SITE.name} — ${SITE.role} — Résumé`,
  author: SITE.name,
  subject: `Résumé of ${SITE.name}, ${SITE.role}: LLM applications, RAG and agents, evaluation and guardrails, and production software on AWS.`,
  keywords: [
    SITE.role,
    "AI Engineer",
    "LLM applications",
    "RAG",
    "agents",
    "evaluation",
    "guardrails",
    "Claude",
    "Python",
    "TypeScript",
    "FastAPI",
    "Next.js",
    "React Native",
    "PostgreSQL",
    "pgvector",
    "AWS",
  ].join(", "),
} as const;

/** Hex SHA-256 of a document or a file's bytes. */
export function sha256(input: string | Uint8Array): string {
  return createHash("sha256").update(input).digest("hex");
}

/** Escapes text for HTML element content and double-quoted attributes. */
const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** An on-site path as the absolute URL a PDF reader can open. */
export const absoluteUrl = (path: string): string => new URL(path, SITE.url).href;

/** "https://www.linkedin.com/in/x" → "linkedin.com/in/x", for display. */
const display = (url: string): string => url.replace(/^https?:\/\/(?:www\.)?/, "").replace(/\/$/, "");

const link = (href: string, label: string): string => `<a href="${esc(href)}">${esc(label)}</a>`;

/** The separator between items on one line; real text, so extracted lines keep it. */
const SEP = " · ";

/**
 * A number stays on the line of the word it counts ("200+ users", "3.5+
 * years", "5–10 users"), by styling, not by a no-break space: the text an ATS
 * extracts keeps ordinary spaces.
 */
const keepNumbersWithUnits = (html: string): string =>
  html.replace(/(?<![\w/#.-])(\d+(?:[.,]\d+)*(?:–\d+(?:[.,]\d+)*)?\+?) ([A-Za-z]+)/g, `<span class="keep">$1 $2</span>`);

/**
 * A short parenthetical stays on one line ("(React Native)", "(Claude,
 * pgvector)"), so a name is never split across lines; a long one may wrap.
 */
const keepShortParentheticals = (html: string): string =>
  html.replace(/\([^()<>]{1,24}\)/g, (group) => `<span class="keep">${group}</span>`);

/**
 * A skill group's items, each kept on one line, so a line breaks between two
 * skills and never inside one ("prompt / engineering"). Items split on the
 * commas outside parentheses, as /skills and the assistant split them.
 */
const skillItems = (items: string): string =>
  items
    .split(/,\s*(?![^()]*\))/)
    .map((item) => `<span class="keep">${esc(item)}</span>`)
    .join(", ");

/**
 * `text` as HTML with the first mention of each flagship product linked to its
 * case study, so the products the résumé leads with are one click from the
 * evidence. The text itself is unchanged, which is what an ATS reads.
 */
function withFlagshipLinks(text: string): string {
  let html = keepShortParentheticals(keepNumbersWithUnits(esc(text)));
  for (const flagship of flagships) {
    const name = esc(flagship.name);
    const at = html.indexOf(name);
    if (at !== -1) {
      html = `${html.slice(0, at)}${link(absoluteUrl(flagshipHref(flagship.slug)), flagship.name)}${html.slice(at + name.length)}`;
    }
  }
  return html;
}

/** An entry's first line: what and where on the left, when on the right. */
const entryHead = (title: string, aside: string): string =>
  `<div class="head"><h3>${title}</h3><p class="aside">${aside}</p></div>`;

const STYLE = `
  @page { size: ${PAGE.size}; margin: ${PAGE.marginBlockMm}mm ${PAGE.marginInlineMm}mm; }
  * { box-sizing: border-box; }
  :root {
    --ink: #131316; --ink-2: #5e5f6e; --ink-3: #6e6f7e; --rule: #dcdce1; --accent: #6b4bff;
    --name: ${TYPE.name}pt; --role: ${TYPE.role}pt; --section: ${TYPE.section}pt; --entry: ${TYPE.entry}pt;
    --text: ${TYPE.text}pt; --small: ${TYPE.small}pt;
  }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; color: var(--ink); font: var(--text)/${TYPE.leading} Arial, "Helvetica Neue", Helvetica, sans-serif; }
  h1, h2, h3, p, ul { margin: 0; }
  a { color: var(--accent); text-decoration: none; }
  h1 { font-size: var(--name); line-height: 1.1; font-weight: 700; letter-spacing: -0.01em; }
  .role { margin-top: 2pt; font-size: var(--role); color: var(--ink-2); }
  .contact { font-size: var(--small); color: var(--ink-2); }
  .role + .contact { margin-top: 5pt; }
  .contact a { color: var(--ink-2); }
  h2 { margin: 11.5pt 0 4pt; padding-bottom: 2pt; border-bottom: 0.75pt solid var(--rule); font-size: var(--section); font-weight: 700; }
  .head { display: flex; justify-content: space-between; align-items: baseline; gap: 12pt; }
  h3 { font-size: var(--entry); font-weight: 700; }
  h3 a { color: var(--ink); }
  h3 .at { font-weight: 400; color: var(--ink-2); }
  .aside { flex: none; font-size: var(--small); color: var(--ink-3); }
  .entry + .entry { margin-top: 6pt; }
  ul { margin-top: 2pt; padding-left: 11pt; }
  li { margin-top: 1.5pt; }
  li::marker { color: var(--ink-3); }
  p, li { text-wrap: pretty; }
  .keep { white-space: nowrap; }
  .detail { margin-top: 1pt; }
  .figure { margin-top: 1pt; font-size: var(--small); color: var(--ink-2); }
  .skill + .skill { margin-top: 1.5pt; }
`;

/** The résumé document the PDF is printed from. Pure: same data, same string. */
export function renderResumeHtml(): string {
  const { labels } = resume;
  // Two lines: how to reach him (with the notice period recruiters screen on),
  // then where his work is. They do not fit one line of A4 at a size a person
  // can read.
  const notice = esc(`Notice period: ${STATUS.noticePeriod}`);
  const reach = [esc(SITE.location), link(PHONE.href, PHONE.display), link(`mailto:${SITE.email}`, SITE.email), notice].join(SEP);
  const profiles = [SITE.url, SITE.socials.github, SITE.socials.linkedin].map((url) => link(url, display(url))).join(SEP);

  const experience = resume.experience
    .map(
      (job) => `<div class="entry">
      ${entryHead(`${esc(job.role)}<span class="at"> — ${esc(job.org)}</span>`, `${esc(job.place)}${SEP}${esc(job.period)}`)}
      <ul>${job.points.map((point) => `<li>${withFlagshipLinks(point)}</li>`).join("")}</ul></div>`,
    )
    .join("");

  const projects = resume.projects
    .map((project) => {
      const caseStudy = absoluteUrl(project.caseStudy);
      const links = [
        link(caseStudy, labels.caseStudy),
        project.demo ? link(project.demo, labels.demo) : null,
        project.source ? link(project.source, labels.source) : null,
      ].filter((l): l is string => l !== null);
      // The stack is in the skills; the name line carries what the project is,
      // the detail how it is built, and the figure what it was measured to do.
      return `<div class="entry">
      ${entryHead(`${link(caseStudy, project.name)}<span class="at"> — ${esc(project.tagline)}</span>`, links.join(SEP))}
      ${project.detail ? `<p class="detail">${esc(project.detail)}</p>` : ""}
      ${project.metrics.map((m) => `<p class="figure">${keepNumbersWithUnits(esc(m.text))}${SEP}${link(absoluteUrl(m.method), labels.method)}</p>`).join("")}</div>`;
    })
    .join("");

  const skills = resume.skills
    .map((s) => `<p class="skill"><strong>${esc(s.group)}:</strong> ${skillItems(s.items)}</p>`)
    .join("");

  const { degree, school, year } = resume.education;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(RESUME_PDF_INFO.title)}</title><style>${STYLE}</style></head><body>
  <h1>${esc(SITE.name)}</h1>
  <p class="role">${esc(SITE.role)}</p>
  <p class="contact">${reach}</p>
  <p class="contact">${profiles}</p>

  <h2>${esc(labels.summary)}</h2>
  <p>${withFlagshipLinks(resume.summary)}</p>

  <h2>${esc(labels.experience)}</h2>
  ${experience}

  <h2>${esc(labels.projects)}</h2>
  ${projects}

  <h2>${esc(labels.skills)}</h2>
  ${skills}

  <h2>${esc(labels.education)}</h2>
  ${entryHead(`${esc(degree)}<span class="at"> — ${esc(school)}</span>`, esc(year))}
</body></html>`;
}
