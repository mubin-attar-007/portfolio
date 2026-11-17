// Copy gate over the prerendered pages: fails when an inline element touches
// the next word with no space between them — "structural</strong>— the",
// "INT4</strong>in". JSX drops whitespace that contains a line break, and the
// compiled output has dropped a space that the source did have, so the source
// alone cannot prove the rendered text reads correctly; the built HTML can.
//
//   npm run build && npm run test:copy
//
// It reads `.next/server/app/**/*.html` directly, so it needs a build but no
// server. Script and style bodies (the RSC payload included) are skipped: only
// the text a reader, a search snippet or a screen reader gets is checked.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(process.cwd(), ".next", "server", "app");
if (!existsSync(ROOT)) {
  console.error("copy-audit: no prerendered pages in .next/server/app — run `npm run build` first.");
  process.exit(1);
}

const INLINE = "strong|em|code|a|b|i|kbd|abbr";
const CHECKS = [
  {
    // A closing inline tag followed directly by a word, digit or dash.
    name: "word glued after an inline element",
    pattern: new RegExp(`</(?:${INLINE})>(?=[A-Za-z0-9\\u2013\\u2014])`, "g"),
  },
  {
    // A word followed directly by an opening inline tag whose text starts a word.
    name: "word glued before an inline element",
    pattern: new RegExp(`(?<=[A-Za-z0-9])<(?:${INLINE})\\b[^>]*>(?=[A-Za-z0-9])`, "g"),
  },
];

/** Every prerendered HTML page under `dir`. */
function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return path.endsWith(".html") ? [path] : [];
  });
}

/** The markup a reader sees: no scripts, styles, or comments. */
const visibleMarkup = (html) =>
  html
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

const files = htmlFiles(ROOT);
if (files.length === 0) {
  console.error("copy-audit: .next/server/app has no HTML pages — run `npm run build` first.");
  process.exit(1);
}

const failures = [];
for (const file of files) {
  const markup = visibleMarkup(readFileSync(file, "utf8"));
  for (const { name, pattern } of CHECKS) {
    for (const match of markup.matchAll(pattern)) {
      const at = match.index ?? 0;
      const context = markup.slice(Math.max(0, at - 40), at + 40).replace(/\s+/g, " ");
      failures.push(`${relative(process.cwd(), file)}: ${name}: …${context}…`);
    }
  }
}

if (failures.length > 0) {
  console.error(`copy-audit: ${failures.length} place(s) where words run together:`);
  for (const failure of failures) console.error(`  ${failure}`);
  console.error('Fix the source with an explicit {" "} next to the inline element.');
  process.exit(1);
}
console.log(`copy-audit: ${files.length} pages, no words run together.`);
