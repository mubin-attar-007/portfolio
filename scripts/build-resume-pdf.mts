/**
 * build-resume-pdf — regenerate /public/Mubin_Attar_Resume.pdf from the SINGLE
 * source of truth (content/resume.ts + config/site.ts), so the site and the PDF
 * can never drift. Run: `node scripts/build-resume-pdf.mts` (Node 24 strips the
 * TS types natively). Renders a clean, ATS-friendly A4 résumé via Playwright's
 * print-to-PDF. No fabricated content — every line comes from the résumé data.
 */
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { resume } from "../content/resume.ts";
import { SITE } from "../config/site.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "..", "public", "Mubin_Attar_Resume.pdf");

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const li = SITE.socials.linkedin.replace(/^https?:\/\//, "");
const gh = SITE.socials.github.replace(/^https?:\/\//, "");

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
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
  .proj { margin-top:8px; }
  .proj:first-of-type { margin-top:2px; }
  .projhead { display:flex; justify-content:space-between; align-items:baseline; gap:10px; }
  .pname { font-weight:700; }
  .plink { font-size:9px; }
  .ptag { margin:2px 0 0; color:var(--muted); }
  .pmeta { margin:2px 0 0; font-size:9px; color:var(--faint); font-family:"SF Mono",ui-monospace,Menlo,monospace; }
  .edu { margin-top:2px; display:flex; justify-content:space-between; gap:10px; align-items:baseline; }
  .edu b { font-weight:700; } .edu .s { color:var(--muted); } .edu .y { font-size:9px; color:var(--faint); font-style:italic; white-space:nowrap; }
</style></head><body>
  <p class="name">${esc(SITE.name)}</p>
  <p class="tag">${esc(SITE.role)} · GenAI · LLMs · MLOps</p>
  <p class="contact">${esc(SITE.location)} &nbsp;·&nbsp; <a href="mailto:${SITE.email}">${esc(SITE.email)}</a>
     &nbsp;·&nbsp; <a href="${SITE.socials.linkedin}">${esc(li)}</a>
     &nbsp;·&nbsp; <a href="${SITE.socials.github}">${esc(gh)}</a></p>

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

  <h2>Featured Projects <span style="color:var(--faint);font-weight:400;letter-spacing:0">— all live &amp; open-source</span></h2>
  ${resume.projects
    .map(
      (p) => `<div class="proj">
      <div class="projhead"><span class="pname">${esc(p.name)}</span>
        <span class="plink"><a href="${p.live}">live</a> · <a href="${p.github}">github</a></span></div>
      <p class="ptag">${esc(p.tagline)}</p>
      <p class="pmeta">${esc(p.metric)} · ${esc(p.stack)}</p></div>`,
    )
    .join("")}

  <h2>Education</h2>
  <div class="edu"><span><b>${esc(resume.education.degree)}</b> <span class="s">— ${esc(resume.education.school)}</span></span>
    <span class="y">${esc(resume.education.year)}</span></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.pdf({ path: OUT, format: "A4", printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log("résumé PDF written →", OUT);
