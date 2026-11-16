/**
 * resume-document — the résumé as one standalone HTML document: the exact
 * input `build-resume-pdf.mts` prints to /public/Mubin_Attar_Resume.pdf.
 *
 * It is kept apart from the printer so `test/resume-pdf.test.mts` can render
 * the same document without a browser and prove the committed PDF is current:
 * the printer records the document's hash in `resume-pdf.lock.json`, and the
 * test fails when content/resume.ts, config/site.ts or the eval registry has
 * changed since. No fabricated content — every line comes from the résumé
 * data, and every figure arrives with its scope, date and method link.
 *
 * The palette literals below exist because a standalone print document cannot
 * read the site's CSS variables; they mirror the light theme
 * (design-system.md §11.1).
 */
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { resume } from "../content/resume.ts";
import { SITE } from "../config/site.ts";

/** Where the printer writes the PDF, and the lock that records its input. */
export const RESUME_PDF_PATH = fileURLToPath(new URL("../public/Mubin_Attar_Resume.pdf", import.meta.url));
export const RESUME_PDF_LOCK_PATH = fileURLToPath(new URL("./resume-pdf.lock.json", import.meta.url));

/** The lock's shape: the document the PDF was printed from, and the PDF itself. */
export type ResumePdfLock = {
  generatedBy: string;
  htmlSha256: string;
  pdfSha256: string;
};

/** Hex SHA-256 of a document or a file's bytes. */
export function sha256(input: string | Uint8Array): string {
  return createHash("sha256").update(input).digest("hex");
}

/** Escapes text for HTML element content and double-quoted attributes. */
const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** An on-site path as the absolute URL a PDF reader can open. */
export const absoluteUrl = (path: string): string => new URL(path, SITE.url).href;

/** "https://mubin-attar.vercel.app" → "mubin-attar.vercel.app", for display. */
const host = (url: string): string => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

const link = (href: string, label: string): string => `<a href="${esc(href)}">${esc(label)}</a>`;

/** The résumé document the PDF is printed from. Pure: same data, same string. */
export function renderResumeHtml(): string {
  const { labels } = resume;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(SITE.name)} — Résumé</title><style>
  @page { size: A4; margin: 14mm 15mm; }
  * { box-sizing: border-box; }
  :root { --ink:#16181d; --muted:#5b606b; --faint:#8a8f9a; --accent:#4b3fb3; --rule:#e2e2e8; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin:0; color:var(--ink); font:10.5px/1.5 "Helvetica Neue", Arial, sans-serif; }
  a { color: var(--accent); text-decoration: none; }
  .name { font-size: 26px; font-weight: 700; letter-spacing:-0.02em; margin:0; }
  .tag { font-size:10px; font-weight:700; letter-spacing:0.12em; color:var(--accent); text-transform:uppercase; margin:3px 0 0; }
  .contact { font-size:9.5px; color:var(--muted); margin:6px 0 0; }
  .contact a { color:var(--muted); }
  h2 { font-size:10px; font-weight:700; letter-spacing:0.11em; text-transform:uppercase; color:var(--accent);
       margin:15px 0 7px; padding-bottom:3px; border-bottom:1px solid var(--rule); }
  .summary { margin:12px 0 0; color:#2b2e36; }
  .skills { display:grid; grid-template-columns:auto 1fr; gap:3px 12px; }
  .skills dt { font-weight:700; color:var(--ink); white-space:nowrap; }
  .skills dd { margin:0; color:var(--muted); }
  .job { margin-top:9px; }
  .job:first-of-type { margin-top:2px; }
  .jobhead { display:flex; justify-content:space-between; align-items:baseline; gap:10px; }
  .role { font-weight:700; }
  .role .org { font-weight:400; color:var(--muted); }
  .meta { font-size:9px; color:var(--faint); white-space:nowrap; font-style:italic; }
  ul { margin:5px 0 0; padding-left:15px; }
  li { margin:0 0 3px; color:#2b2e36; }
  li::marker { color:var(--faint); }
  .proj { margin-top:8px; break-inside:avoid; }
  .proj:first-of-type { margin-top:2px; }
  .projhead { display:flex; justify-content:space-between; align-items:baseline; gap:10px; }
  .pname { font-weight:700; }
  .pname a { color:var(--ink); }
  .pstack { margin-left:6px; font-weight:400; font-size:9px; color:var(--faint); font-family:"SF Mono",ui-monospace,Menlo,monospace; }
  .plink { font-size:9px; white-space:nowrap; }
  .ptag { margin:2px 0 0; color:var(--muted); }
  .pmeta { margin:2px 0 0; font-size:9px; color:var(--faint); font-family:"SF Mono",ui-monospace,Menlo,monospace; }
  .edu { margin-top:2px; display:flex; justify-content:space-between; gap:10px; align-items:baseline; }
  .edu b { font-weight:700; } .edu .s { color:var(--muted); } .edu .y { font-size:9px; color:var(--faint); font-style:italic; white-space:nowrap; }
</style></head><body>
  <p class="name">${esc(SITE.name)}</p>
  <p class="tag">${esc(SITE.role)} · GenAI · LLMs · MLOps</p>
  <p class="contact">${esc(SITE.location)} &nbsp;·&nbsp; ${link(`mailto:${SITE.email}`, SITE.email)}
     &nbsp;·&nbsp; ${link(SITE.url, host(SITE.url))}
     &nbsp;·&nbsp; ${link(SITE.socials.linkedin, host(SITE.socials.linkedin))}
     &nbsp;·&nbsp; ${link(SITE.socials.github, host(SITE.socials.github))}</p>

  <h2>Summary</h2>
  <p class="summary">${esc(resume.summary)}</p>

  <h2>Technical Skills</h2>
  <dl class="skills">
    ${resume.skills.map((s) => `<dt>${esc(s.group)}</dt><dd>${esc(s.items)}</dd>`).join("")}
  </dl>

  <h2>Experience</h2>
  ${resume.experience
    .map(
      (e) => `<div class="job">
      <div class="jobhead"><span class="role">${esc(e.org)} <span class="org">— ${esc(e.role)}</span></span>
        <span class="meta">${esc(e.place)} · ${esc(e.period)}</span></div>
      <ul>${e.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div>`,
    )
    .join("")}

  <h2>Featured Projects <span style="color:var(--faint);font-weight:400;letter-spacing:0">— ${esc(labels.projectsNote)}</span></h2>
  ${resume.projects
    .map((p) => {
      const caseStudy = absoluteUrl(p.caseStudy);
      const links = [
        link(caseStudy, labels.caseStudy),
        p.demo ? link(p.demo, labels.demo) : null,
        p.source ? link(p.source, labels.source) : null,
      ].filter((l): l is string => l !== null);
      // The stack rides on the name line, which keeps the résumé to one page.
      return `<div class="proj">
      <div class="projhead"><span class="pname">${link(caseStudy, p.name)}<span class="pstack">${esc(p.stack)}</span></span>
        <span class="plink">${links.join(" · ")}</span></div>
      <p class="ptag">${esc(p.tagline)}</p>
      ${p.metrics.map((m) => `<p class="pmeta">${esc(m.text)} · ${link(absoluteUrl(m.method), labels.method)}</p>`).join("")}</div>`;
    })
    .join("")}

  <h2>Education</h2>
  <div class="edu"><span><b>${esc(resume.education.degree)}</b> <span class="s">— ${esc(resume.education.school)}</span></span>
    <span class="y">${esc(resume.education.year)}</span></div>
</body></html>`;
}
