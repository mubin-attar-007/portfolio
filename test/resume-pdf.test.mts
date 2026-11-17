// Keeps public/Mubin_Attar_Resume.pdf current. The PDF is printed from one
// HTML document (scripts/resume-document.mts), and `npm run build:resume`
// records that document's hash and the PDF's hash in
// scripts/resume-pdf.lock.json. Re-rendering the document here and hashing the
// committed PDF proves the file a recruiter downloads says what content/resume.ts,
// config/site.ts and the eval registry say today. It also checks the links the
// PDF must carry: the site, every case study, every method, and only the demos
// the site links.
//
//   node --test test/resume-pdf.test.mts

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  RESUME_PDF_LOCK_PATH,
  RESUME_PDF_PATH,
  absoluteUrl,
  renderResumeHtml,
  sha256,
  type ResumePdfLock,
} from "../scripts/resume-document.mts";
import { resume } from "../content/resume.ts";
import { SITE } from "../config/site.ts";

const REGENERATE = "run `npm run build:resume` and commit the PDF with scripts/resume-pdf.lock.json";

const lock = JSON.parse(readFileSync(RESUME_PDF_LOCK_PATH, "utf8")) as ResumePdfLock;
const pdf = readFileSync(RESUME_PDF_PATH);

/** The link targets in the PDF, normalised the way Chromium writes them. */
const pdfLinks = new Set(
  [...pdf.toString("latin1").matchAll(/\/URI \(([^)]*)\)/g)].map(([, uri]) => new URL(uri!).href),
);
const normal = (href: string): string => new URL(href).href;

test("the committed PDF was printed from the current résumé data", () => {
  assert.equal(lock.htmlSha256, sha256(renderResumeHtml()), `the résumé changed since the PDF was printed — ${REGENERATE}`);
  assert.equal(lock.pdfSha256, sha256(pdf), `public/Mubin_Attar_Resume.pdf is not the file the generator wrote — ${REGENERATE}`);
});

test("the PDF links the site and the profiles", () => {
  for (const href of [SITE.url, `mailto:${SITE.email}`, SITE.socials.linkedin, SITE.socials.github]) {
    assert.ok(pdfLinks.has(normal(href)), `the PDF links ${href} — ${REGENERATE}`);
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
