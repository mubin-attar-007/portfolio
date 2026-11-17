import fs from "node:fs";
import path from "node:path";
import { projects } from "@/content/projects";

/**
 * Stack evidence — which public case studies list a tool in their own `stack`
 * frontmatter (content/projects/<slug>.mdx). /uses and /skills link a tool to a
 * project ONLY through this lookup, so a "used in" link is never asserted by
 * hand: if the case study does not list the tool, no link is drawn.
 *
 * Server-only (reads the filesystem at render; the pages are static).
 */

export type Evidence = { slug: string; title: string; href: string };

/** Names the case studies write differently from /uses and the résumé. */
const ALIASES: Record<string, readonly string[]> = {
  postgresql: ["postgres"],
  "django / drf": ["django", "drf"],
  "django/drf": ["django", "drf"],
};

const STACK_LINE = /^stack:\s*(\[.*\])\s*$/m;

function readStack(slug: string): string[] {
  try {
    const source = fs.readFileSync(path.join(process.cwd(), "content", "projects", `${slug}.mdx`), "utf8");
    const match = STACK_LINE.exec(source);
    const parsed: unknown = match ? JSON.parse(match[1]!) : [];
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

const STACKS = [...projects]
  .sort((a, b) => a.order - b.order)
  .map((project) => ({
    evidence: { slug: project.slug, title: project.title, href: `/work/${project.slug}` },
    stack: readStack(project.slug).map((entry) => entry.toLowerCase()),
  }));

/** A stack entry names the tool when it is the tool, or the tool plus a version ("Next.js 15"). */
function names(entry: string, term: string): boolean {
  return entry === term || entry.startsWith(`${term} `);
}

/** The case studies whose stack lists `tool` (case-insensitive, versions ignored). */
export function evidenceFor(tool: string): Evidence[] {
  const term = tool.trim().toLowerCase();
  const terms = [term, ...(ALIASES[term] ?? [])];
  return STACKS.filter(({ stack }) => stack.some((entry) => terms.some((t) => names(entry, t)))).map(
    ({ evidence }) => evidence,
  );
}

/** The case studies that list ANY of `tools`, each once, in registry order. */
export function evidenceForAny(tools: readonly string[]): Evidence[] {
  const slugs = new Set(tools.flatMap((tool) => evidenceFor(tool).map((e) => e.slug)));
  return STACKS.filter(({ evidence }) => slugs.has(evidence.slug)).map(({ evidence }) => evidence);
}
