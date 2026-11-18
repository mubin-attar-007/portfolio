/**
 * build-resume-pdf — regenerate /public/Mubin_Attar_Resume.pdf from the SINGLE
 * source of truth (content/resume.ts + config/site.ts + the flagship records +
 * the eval registry), so the site and the PDF can never drift. Run
 * `npm run build:resume` (Node 24 strips the TS types natively; the alias
 * loader resolves the `@/` imports).
 *
 * The document itself is rendered by resume-document.mts; this script prints
 * it to an A4 PDF with Playwright's print-to-PDF (real, selectable text, tagged
 * for screen readers), then:
 * - fails, writing nothing, unless the résumé fits exactly one page;
 * - sets the document properties Chromium leaves out (author, subject,
 *   keywords) with pdf-info.mts;
 * - warns about a bullet longer than two lines, or a paragraph or bullet whose
 *   last line is one word, measured in the same browser at the printed width;
 * - records the document's hash and the PDF's hash in resume-pdf.lock.json.
 *
 * The unit test in test/resume-pdf.test.mts recomputes both hashes, so a
 * résumé, site-config, flagship or registry change that is not followed by a
 * regeneration fails `npm test`.
 */
import { writeFileSync } from "node:fs";
import { chromium } from "playwright";
import { pdfPageCount, readPdfInfo, writePdfInfo } from "./pdf-info.mts";
import {
  PAGE,
  RESUME_PDF_INFO,
  RESUME_PDF_LOCK_PATH,
  RESUME_PDF_PATH,
  renderResumeHtml,
  sha256,
  type ResumePdfLock,
} from "./resume-document.mts";

/** The longest a bullet may run, in lines: a recruiter skims, and a third line is not read. */
const MAX_BULLET_LINES = 2;

/** One paragraph or bullet as the printed page sets it. */
type SetText = { text: string; bullet: boolean; lines: number; lastLineWords: number };

/**
 * Runs in the page: every paragraph and bullet with its line count and the
 * number of words on its last line, set at the printed text width. A word's
 * line is the top of its last box; a separator such as "·" is not a word.
 */
function measureText(contentWidth: string): SetText[] {
  document.body.style.width = contentWidth;
  const set = [...document.querySelectorAll<HTMLElement>("p, li")].map((element) => {
    const tops: number[] = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      for (const match of (node.textContent ?? "").matchAll(/\S+/g)) {
        if (!/[\p{L}\p{N}]/u.test(match[0])) continue;
        const range = document.createRange();
        const start = match.index ?? 0;
        range.setStart(node, start);
        range.setEnd(node, start + match[0].length);
        const boxes = range.getClientRects();
        const last = boxes[boxes.length - 1];
        if (last) tops.push(last.top);
      }
    }
    const halfLine = parseFloat(getComputedStyle(element).lineHeight) / 2;
    let lines = 0;
    let lastLineWords = 0;
    let lineTop = Number.NEGATIVE_INFINITY;
    for (const top of tops) {
      if (top - lineTop > halfLine) {
        lines += 1;
        lastLineWords = 0;
        lineTop = top;
      }
      lastLineWords += 1;
    }
    return { text: (element.textContent ?? "").trim(), bullet: element.tagName === "LI", lines, lastLineWords };
  });
  document.body.style.width = "";
  return set;
}

const html = renderResumeHtml();

const browser = await chromium.launch();
let printed: Buffer;
let layout: SetText[];
try {
  const page = await browser.newPage();
  await page.emulateMedia({ media: "print" });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  layout = await page.evaluate(measureText, PAGE.contentWidth);
  printed = await page.pdf({ format: PAGE.size, printBackground: true, preferCSSPageSize: true, tagged: true });
} finally {
  await browser.close();
}

const pages = pdfPageCount(printed);
if (pages !== 1) {
  console.error(
    `résumé: ${pages || "an unreadable number of"} pages — it must fit exactly one ${PAGE.size} page. ` +
      "Tighten content/resume.ts (or the document's spacing) and run `npm run build:resume` again. Nothing was written.",
  );
  process.exit(1);
}

const pdf = writePdfInfo(printed, RESUME_PDF_INFO);
const written = readPdfInfo(pdf);
for (const [key, value] of Object.entries({ Title: RESUME_PDF_INFO.title, Author: RESUME_PDF_INFO.author, Subject: RESUME_PDF_INFO.subject, Keywords: RESUME_PDF_INFO.keywords })) {
  if (written[key] !== value) throw new Error(`résumé: the PDF's ${key} did not read back as written.`);
}
writeFileSync(RESUME_PDF_PATH, pdf);

const lock: ResumePdfLock = {
  generatedBy: "npm run build:resume",
  htmlSha256: sha256(html),
  pdfSha256: sha256(pdf),
};
writeFileSync(RESUME_PDF_LOCK_PATH, `${JSON.stringify(lock, null, 2)}\n`);

console.log(`résumé PDF written → ${RESUME_PDF_PATH} (1 page, ${(pdf.length / 1024).toFixed(1)} KB)`);
console.log("lock written →", RESUME_PDF_LOCK_PATH);

const clip = (text: string): string => (text.length > 72 ? `${text.slice(0, 72)}…` : text);
const long = layout.filter((t) => t.bullet && t.lines > MAX_BULLET_LINES);
const orphans = layout.filter((t) => t.lines > 1 && t.lastLineWords === 1);
for (const t of long) console.warn(`warning: a bullet runs ${t.lines} lines (at most ${MAX_BULLET_LINES}): "${clip(t.text)}"`);
for (const t of orphans) console.warn(`warning: one word alone on the last line: "${clip(t.text)}"`);
if (long.length === 0 && orphans.length === 0) console.log(`layout: every bullet within ${MAX_BULLET_LINES} lines, no one-word last line.`);
