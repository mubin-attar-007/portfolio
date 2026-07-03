// Server-only loader for the project case studies authored as MDX in
// /content/projects/*.mdx. Reads the raw file, and (where needed) compiles the
// body with next-mdx-remote/rsc. Frontmatter is the typed source of truth for
// each case study's slug/name/tagline/stack/live/github/accent/order.
//
// This is the ONLY place that touches the filesystem for case studies — pages
// import typed helpers from here so the MDX location can change without
// rippling through the app.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactElement } from "react";
import { projectMeta, type ProjectMeta } from "@/lib/content";
import { mdxComponents, slugify } from "@/components/mdx-components";

/** One entry in a case study's table of contents (h2 sections only). */
export type TocItem = { id: string; label: string };

/**
 * Extract the h2 section headings from raw MDX (after stripping frontmatter and
 * fenced code blocks so a `##` inside a code fence is never mistaken for a
 * heading). Ids match the slugs the MDX h2 component generates.
 */
function extractToc(source: string): TocItem[] {
  // drop leading YAML frontmatter
  const body = source.replace(/^---\n[\s\S]*?\n---\n?/, "");
  // blank out fenced code blocks
  const noCode = body.replace(/```[\s\S]*?```/g, "");
  const items: TocItem[] = [];
  const re = /^##\s+(.+?)\s*$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(noCode)) !== null) {
    const label = m[1].trim();
    items.push({ id: slugify(label), label });
  }
  return items;
}

/** Frontmatter shape authored at the top of each /content/projects/<slug>.mdx. */
export type CaseStudyFrontmatter = {
  slug: string;
  name: string;
  tagline: string;
  stack: string[];
  live: string;
  github: string;
  accent: string;
  order: number;
};

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

/** Ordered list of case-study slugs (drives generateStaticParams + prev/next). */
export const caseStudySlugs: string[] = projectMeta.map((p) => p.slug);

/** True when a slug maps to a real, enrolled case study. */
export function isCaseStudySlug(slug: string): boolean {
  return caseStudySlugs.includes(slug);
}

/** The projectMeta row for a slug, or undefined if unknown. */
export function caseStudyMeta(slug: string): ProjectMeta | undefined {
  return projectMeta.find((p) => p.slug === slug);
}

/**
 * Previous / next case study relative to `slug`, by authored `order`.
 * Wraps around so navigation is always populated (four live systems).
 */
export function caseStudyNeighbors(slug: string): {
  prev: ProjectMeta;
  next: ProjectMeta;
} | null {
  const ordered = [...projectMeta].sort((a, b) => a.order - b.order);
  const i = ordered.findIndex((p) => p.slug === slug);
  if (i === -1) return null;
  const prev = ordered[(i - 1 + ordered.length) % ordered.length];
  const next = ordered[(i + 1) % ordered.length];
  return { prev, next };
}

/**
 * Read + compile a single case study's MDX. Returns the typed frontmatter and
 * the rendered body (styled via the shared design-language MDX components).
 * Returns null when the slug has no MDX file, so callers can notFound().
 */
export async function loadCaseStudy(slug: string): Promise<{
  frontmatter: CaseStudyFrontmatter;
  content: ReactElement;
  toc: TocItem[];
} | null> {
  if (!isCaseStudySlug(slug)) return null;

  let source: string;
  try {
    source = await readFile(path.join(PROJECTS_DIR, `${slug}.mdx`), "utf8");
  } catch {
    return null;
  }

  const { content, frontmatter } = await compileMDX<CaseStudyFrontmatter>({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: true,
      // Body is prose + fenced code only — no MDX JS expressions. Keep the
      // secure defaults (blockJS) on; nothing in these files needs eval.
      mdxOptions: { format: "mdx" },
    },
  });

  return { content, frontmatter, toc: extractToc(source) };
}
