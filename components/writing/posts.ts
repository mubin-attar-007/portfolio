import fs from "node:fs";
import path from "node:path";
import { projectBySlug } from "@/content/projects";
import type { PostKind } from "@/content/pages/writing";
import type { TocItem } from "@/components/ui/toc";
import { slugify } from "@/components/mdx/mdx-components";
import { contentFilePath } from "@/lib/content-slug";
import { byDateDesc } from "@/lib/feed";
import { allNotes } from "@/lib/notes";
import { allWriting } from "@/lib/writing";

/**
 * The writing index's view of both MDX collections: essays and guides
 * (content/writing) and notes (content/notes), merged newest first. Server
 * only; it hands plain, serialisable rows to the page.
 */
export type PostSummary = {
  slug: string;
  href: string;
  title: string;
  summary: string | null;
  date: string;
  kind: PostKind;
};

export type ArticleCollectionDir = "writing" | "notes";

export async function allPosts(): Promise<PostSummary[]> {
  const [writing, notes] = await Promise.all([allWriting(), allNotes()]);
  const rows: PostSummary[] = [
    ...writing.map((w) => ({
      slug: w.slug,
      href: `/writing/${w.slug}`,
      title: w.title,
      summary: w.summary,
      date: w.date,
      kind: w.category,
    })),
    ...notes.map((n) => ({
      slug: n.slug,
      href: `/notes/${n.slug}`,
      title: n.title,
      summary: n.summary ?? null,
      date: n.date,
      kind: "note" as const,
    })),
  ];
  return rows.sort(byDateDesc);
}

/** The long-form pieces (essays and guides) that get a cover on the index. */
export const FEATURED_COUNT = 3;

function rawSource(dir: ArticleCollectionDir, slug: string): string {
  const file = contentFilePath(path.join(process.cwd(), "content", dir), slug, ".mdx");
  return file && fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

/** Markdown heading text as it renders: code ticks, emphasis and link targets removed. */
function plainHeading(text: string): string {
  return text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*_]/g, "")
    .trim();
}

/**
 * The "Jump to" entries: the body's `##` and `###` headings, outside fenced
 * code, with the same ids the MDX heading components give them (`slugify`), so
 * every entry lands on a real target.
 */
export function articleHeadings(dir: ArticleCollectionDir, slug: string): TocItem[] {
  const items: { id: string; label: string; items: TocItem[] }[] = [];
  let inFence = false;
  for (const line of rawSource(dir, slug).split(/\r?\n/)) {
    if (line.trimStart().startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line);
    if (!match) continue;
    const label = plainHeading(match[2]!);
    const entry = { id: slugify(label), label, items: [] };
    if (match[1] === "##" || items.length === 0) items.push(entry);
    else items[items.length - 1]!.items.push(entry);
  }
  return items.map(({ items: sub, ...rest }) => (sub.length ? { ...rest, items: sub } : rest));
}

/** The first case study the body links to, if any: the post's related project. */
export function relatedProject(dir: ArticleCollectionDir, slug: string) {
  const match = /\]\(\/work\/([a-z0-9-]+)\)/.exec(rawSource(dir, slug));
  return match ? (projectBySlug(match[1]!) ?? null) : null;
}
