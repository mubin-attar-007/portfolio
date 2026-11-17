/**
 * build-resume-pdf — regenerate /public/Mubin_Attar_Resume.pdf from the SINGLE
 * source of truth (content/resume.ts + config/site.ts + the eval registry), so
 * the site and the PDF can never drift. Run `npm run build:resume` (Node 24
 * strips the TS types natively; the alias loader resolves the `@/` imports).
 *
 * The document itself is rendered by resume-document.mts; this script prints
 * it to an ATS-friendly A4 PDF with Playwright's print-to-PDF, then records the
 * document's hash and the PDF's hash in resume-pdf.lock.json. The unit test in
 * test/resume-pdf.test.mts recomputes both, so a résumé, site-config or
 * registry change that is not followed by a regeneration fails `npm test`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
import {
  RESUME_PDF_LOCK_PATH,
  RESUME_PDF_PATH,
  renderResumeHtml,
  sha256,
  type ResumePdfLock,
} from "./resume-document.mts";

const html = renderResumeHtml();

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.pdf({ path: RESUME_PDF_PATH, format: "A4", printBackground: true, preferCSSPageSize: true });
} finally {
  await browser.close();
}

const lock: ResumePdfLock = {
  generatedBy: "npm run build:resume",
  htmlSha256: sha256(html),
  pdfSha256: sha256(readFileSync(RESUME_PDF_PATH)),
};
writeFileSync(RESUME_PDF_LOCK_PATH, `${JSON.stringify(lock, null, 2)}\n`);

console.log("résumé PDF written →", RESUME_PDF_PATH);
console.log("lock written →", RESUME_PDF_LOCK_PATH);
