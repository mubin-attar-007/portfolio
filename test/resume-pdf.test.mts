// Keeps public/Mubin_Attar_Resume.pdf current, readable by résumé-screening
// software, and honest. The PDF is printed from one HTML document
// (scripts/resume-document.mts), and `npm run build:resume` records that
// document's hash and the PDF's hash in scripts/resume-pdf.lock.json.
// Re-rendering the document here and hashing the committed PDF proves the file
// a recruiter downloads says what content/resume.ts, config/site.ts, the
// flagship records and the eval registry say today. It also checks:
// - the links the PDF must carry: the site, the profiles, the phone, both
//   flagship case studies, every project's case study and method, and only
//   the demos the site links;
// - that it is one A4 page, with its document properties set;
// - the ATS rules the document is built to: the five standard headings in
//   order, as plain words, and no layout an extractor scrambles;
// - the facts: the approved figures and credits in the owner's words, both
//   titles, every figure named by how it was measured, AWS services only from
//   the flagship stacks, and no claim the record cannot back.
//
//   node --import ./test/alias-loader.mjs --test test/resume-pdf.test.mts

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  PAGE,
  PHONE,
  RESUME_PDF_INFO,
  TYPE,
  RESUME_PDF_LOCK_PATH,
  RESUME_PDF_PATH,
  absoluteUrl,
  renderResumeHtml,
  sha256,
  type ResumePdfLock,
} from "../scripts/resume-document.mts";
import { pdfPageCount, readPdfInfo } from "../scripts/pdf-info.mts";
import { RESUME_AWS, resume } from "../content/resume.ts";
import { flagshipHref, flagships } from "../content/flagship/index.ts";
import { USAGE } from "../content/flagship/shared.ts";
import { SITE } from "../config/site.ts";

const REGENERATE = "run `npm run build:resume` and commit the PDF with scripts/resume-pdf.lock.json";

const lock = JSON.parse(readFileSync(RESUME_PDF_LOCK_PATH, "utf8")) as ResumePdfLock;
const pdf = readFileSync(RESUME_PDF_PATH);
const html = renderResumeHtml();
const style = /<style>([\s\S]*?)<\/style>/.exec(html)?.[1] ?? "";

/** The document's words as an extractor reads them: no markup, entities decoded, spaces collapsed. */
const text = html
  .replace(/<(style|title)>[\s\S]*?<\/\1>/g, "")
  .replace(/<\/(?:p|li|h1|h2|h3|div)>/g, " ")
  .replace(/<[^>]+>/g, "")
  .replace(/&quot;/g, '"')
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&amp;/g, "&")
  .replace(/\s+/g, " ");

/** The link targets in the PDF, normalised the way Chromium writes them. */
const pdfLinks = new Set(
  [...pdf.toString("latin1").matchAll(/\/URI \(([^)]*)\)/g)].map(([, uri]) => new URL(uri!).href),
);
const normal = (href: string): string => new URL(href).href;

test("the committed PDF was printed from the current résumé data", () => {
  assert.equal(lock.htmlSha256, sha256(html), `the résumé changed since the PDF was printed — ${REGENERATE}`);
  assert.equal(lock.pdfSha256, sha256(pdf), `public/Mubin_Attar_Resume.pdf is not the file the generator wrote — ${REGENERATE}`);
});

test("the PDF is one A4 page with its document properties set", () => {
  assert.equal(pdfPageCount(pdf), 1, `the résumé must fit one page — ${REGENERATE}`);
  const box = /\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/.exec(pdf.toString("latin1"));
  assert.ok(box, "the page declares its size");
  // A4 is 595.28 × 841.89 pt; Chromium rounds the page to whole CSS pixels.
  assert.ok(Math.abs(Number(box[1]) - 595.28) < 1 && Math.abs(Number(box[2]) - 841.89) < 1, `an A4 page, not ${box[1]} × ${box[2]}`);

  const info = readPdfInfo(pdf);
  assert.equal(info.Title, RESUME_PDF_INFO.title);
  assert.equal(info.Author, RESUME_PDF_INFO.author);
  assert.equal(info.Subject, RESUME_PDF_INFO.subject);
  assert.equal(info.Keywords, RESUME_PDF_INFO.keywords);
  assert.equal(RESUME_PDF_INFO.title, `${SITE.name} — ${SITE.role} — Résumé`);
});

test("the page fits by cutting words, never by shrinking type", () => {
  // The sizes a recruiter reads comfortably on paper, and margins that leave white space.
  assert.ok(TYPE.text >= 10, `body text is ${TYPE.text} pt; at least 10`);
  assert.ok(TYPE.small >= 9, `the smallest text is ${TYPE.small} pt; at least 9`);
  assert.ok(TYPE.entry >= 10.5, `entry titles are ${TYPE.entry} pt; at least 10.5`);
  assert.ok(TYPE.leading >= 1.35, `the leading is ${TYPE.leading}; at least 1.35`);
  assert.ok(PAGE.marginBlockMm >= 12 && PAGE.marginInlineMm >= 13, `margins ${PAGE.marginBlockMm}/${PAGE.marginInlineMm} mm; at least 12/13`);
  // Every size in the document comes from that scale, so nothing slips under it.
  assert.match(style, new RegExp(`--text: ${TYPE.text}pt; --small: ${TYPE.small}pt`));
  for (const [, size] of style.matchAll(/font-size:\s*([^;}]+)/g)) {
    assert.match(size!, /^var\(--[a-z]+\)$/, `a font size outside the type scale: ${size}`);
  }
});

test("every metadata keyword is a term the résumé itself uses", () => {
  const stuffed = RESUME_PDF_INFO.keywords.split(", ").filter((keyword) => !text.includes(keyword));
  assert.deepEqual(stuffed, [], `keywords the document never uses: ${stuffed.join(", ")}`);
});

test("the document is built the way résumé-screening software reads", () => {
  const headings = [...html.matchAll(/<h2>([^<]*)<\/h2>/g)].map(([, heading]) => heading);
  assert.deepEqual(headings, ["Summary", "Experience", "Projects", "Skills", "Education"], "the five standard headings, in order");
  assert.equal([...html.matchAll(/<h1>/g)].length, 1, "one name, at the top");
  // Spaced-out or transformed capitals come out of an extractor as single letters ("E D U C A T I O N").
  assert.doesNotMatch(style, /text-transform/, "headings are written as they read");
  for (const [, value] of style.matchAll(/letter-spacing:\s*([^;}]+)/g)) {
    assert.ok(Number.parseFloat(value!) <= 0, `no spaced-out letters (letter-spacing: ${value})`);
  }
  // One column of real text: no pictures, tables, grids, columns or floating boxes.
  assert.doesNotMatch(html, /<(?:img|svg|table|canvas|iframe)\b/i, "no images or tables");
  assert.doesNotMatch(style, /display:\s*grid|column-count|columns:|float:|position:\s*(?:absolute|fixed)/, "one column, in reading order");
});

test("the PDF links the site, the profiles and the phone", () => {
  for (const href of [SITE.url, `mailto:${SITE.email}`, SITE.socials.linkedin, SITE.socials.github, PHONE.href]) {
    assert.ok(pdfLinks.has(normal(href)), `the PDF links ${href} — ${REGENERATE}`);
  }
});

test("the PDF links both flagship case studies", () => {
  for (const flagship of flagships) {
    assert.ok(pdfLinks.has(absoluteUrl(flagshipHref(flagship.slug))), `${flagship.name}: case study — ${REGENERATE}`);
  }
});

test("every project links its case study, its source, and every method; a demo only while it is up", () => {
  for (const p of resume.projects) {
    assert.ok(pdfLinks.has(absoluteUrl(p.caseStudy)), `${p.name}: case study`);
    if (p.source) assert.ok(pdfLinks.has(normal(p.source)), `${p.name}: source`);
    if (p.demo) assert.ok(pdfLinks.has(normal(p.demo)), `${p.name}: demo`);
    for (const m of p.metrics) {
      assert.ok(pdfLinks.has(absoluteUrl(m.method)), `${p.name}: method for ${m.topic}`);
    }
  }
  const demos = new Set(resume.projects.flatMap((p) => (p.demo ? [normal(p.demo)] : [])));
  const hosted = [...pdfLinks].filter((href) => /\.(?:vercel\.app|hf\.space)\//.test(href) && !href.startsWith(normal(SITE.url)));
  const stray = hosted.filter((href) => !demos.has(href));
  assert.deepEqual(stray, [], `the PDF links a demo the site no longer links: ${stray.join(", ")}`);
});

test("the facts are the approved ones, in the owner's words", () => {
  assert.ok(text.includes(SITE.role), "the headline is the brand role");
  // The brand role and the employment title are both true and stay distinct (ADR-015).
  assert.ok(text.includes("AI/ML Engineer — Sevina Technologies"), "the job title the employer gave");
  assert.ok(text.includes("3.5+ years"), "experience, as approved");
  assert.ok(text.includes(USAGE["bench-discovery"].sentence), "Bench Discovery's usage, word for word");
  assert.ok(text.includes(USAGE.careltc.short), "CareLTC's usage, word for word");
  // The credits in the résumé's register: sole engineer of one, lead engineer for the other.
  assert.ok(text.includes("Sole engineer of Bench Discovery"), "Bench Discovery's credit");
  assert.ok(text.includes(`Lead engineer for CareLTC (${USAGE.careltc.short})`), "CareLTC's credit");
  const banned = [
    /forward[- ]deployed|\bFDE\b/i,
    /\b5 clients\b|\b10 desktop users\b|\b5 admins\b|200\s*[–-]\s*300/i,
    /\bdaily\b/i,
    /fully offline|no network access|nothing leaves/i,
    /\bHIPAA\b|end-to-end encrypted|\bcertified\b/i,
    /\b(?:colleague|teammate|co-?worker)s?\b/i,
  ];
  for (const rule of banned) assert.doesNotMatch(text, rule, `the résumé claims what the record cannot back: ${rule}`);
});

test("every figure is named by how it was measured", () => {
  // "Accuracy" appears only in the policy line's "not model accuracy"; never
  // alone, live or as a return.
  for (const { index } of text.matchAll(/accuracy/gi)) {
    const before = text.slice(0, index);
    assert.ok(/not model $/.test(before), `an unscoped accuracy: "…${before.slice(-40)}accuracy"`);
  }
  assert.match(text, /deterministic policy test, not model accuracy/);
  // The Spider sample's scope needs more than a line; /evals carries it in full.
  assert.doesNotMatch(text, /Spider/);
});

test("every AWS service the skills name runs in a flagship's stack", () => {
  const deployed = new Set<string>(flagships.flatMap((flagship) => flagship.stack.aws));
  for (const { label, services } of RESUME_AWS) {
    for (const service of services) assert.ok(deployed.has(service), `${label}: ${service} is in no flagship stack`);
  }
  const cloud = resume.skills.find((group) => group.group === "Cloud (AWS)");
  assert.equal(cloud?.items, RESUME_AWS.map((service) => service.label).join(", "), "the skills line names exactly the selection");
});
