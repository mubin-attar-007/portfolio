// -----------------------------------------------------------------------------
// The MDX collection loader behind content/writing and content/notes.
//
// The two collections differ only by directory and Zod schema, so they share one
// implementation: read .mdx files, validate frontmatter (the build fails on a
// bad file), and compile bodies on demand.
//
// DRAFTS ARE UNPUBLISHED, NOT MERELY UNLISTED. `draft: true` removes an entry
// from the index, the feeds, the sitemap, and the set of generated routes — and
// `load()` refuses it, so a guessed URL 404s instead of serving unfinished work.
// In `next dev` drafts stay reachable so a post can be previewed while it is
// being written; nothing else in the app distinguishes the two environments.
// -----------------------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { byDateDesc } from "@/lib/feed";
import { readingMinutes } from "@/lib/reading-time";

const MDX_EXTENSION = ".mdx";

/**
 * Drafts are readable in development only. `next build` runs with
 * NODE_ENV=production, so nothing draft-flagged can reach a deployed route,
 * feed, or sitemap entry.
 */
const DRAFTS_VISIBLE = process.env.NODE_ENV !== "production";

/** The frontmatter fields this module needs from every collection's schema. */
export type CollectionMeta = {
  slug: string;
  date: string;
  draft: boolean;
};

/**
 * Minimal structural view of a Zod schema — enough to validate, without
 * coupling this module to a zod version's generic signature.
 */
type Validator<T> = { parse: (input: unknown) => T };

/** The rendered MDX body, exactly as next-mdx-remote types it. */
type CompiledContent = Awaited<ReturnType<typeof compileMDX>>["content"];

/** A compiled entry: validated frontmatter plus its rendered MDX body. */
export type LoadedEntry<T> = {
  meta: T;
  content: CompiledContent;
  /**
   * Estimated reading time in whole minutes, measured from the RAW source
   * before compilation — the only point where the prose is still a string.
   * 0 for a body with no prose, which lets the article header omit the item
   * rather than print "0 min read".
   */
  readingMinutes: number;
};

/**
 * The published entries either side of one slug, in the collection's own
 * newest-first order. Named by direction in TIME rather than "prev"/"next",
 * which is ambiguous the moment a reader stops assuming which way the index
 * runs — and which is exactly the label that ends up on screen.
 */
export type Neighbours<T> = {
  /** The entry published after this one, if any. */
  newer: T | null;
  /** The entry published before this one, if any. */
  older: T | null;
};

export type MdxCollection<T extends CollectionMeta> = {
  /** Slugs of published entries, newest first. Never includes drafts. */
  publishedSlugs: () => Promise<string[]>;
  /** Slugs that should resolve to a page. Adds drafts in development only. */
  routableSlugs: () => Promise<string[]>;
  /** Published frontmatter, newest first. */
  all: () => Promise<T[]>;
  /** Compile one entry, or null if it is missing or an unpublished draft. */
  load: (slug: string) => Promise<LoadedEntry<T> | null>;
  /**
   * The published entries either side of `slug`. Drafts are never returned as
   * a neighbour — a draft is unpublished, so linking to one from a live article
   * would leak it. A draft previewed in dev therefore has no neighbours, which
   * is correct: it has no place in the published sequence yet.
   */
  neighbours: (slug: string) => Promise<Neighbours<T>>;
};

/**
 * Build the loader for one MDX collection.
 *
 * @param dir     Directory relative to the repo root, e.g. "content/writing".
 * @param schema  Zod schema for the collection's frontmatter. Parsed eagerly so
 *                an invalid file fails the build rather than rendering blank.
 */
export function createMdxCollection<T extends CollectionMeta>(
  dir: string,
  schema: Validator<T>,
): MdxCollection<T> {
  const root = path.join(process.cwd(), dir);

  const fileSlugs = (): string[] => {
    if (!fs.existsSync(root)) return [];
    return fs
      .readdirSync(root)
      .filter((file) => file.endsWith(MDX_EXTENSION))
      .map((file) => file.slice(0, -MDX_EXTENSION.length));
  };

  const sourceOf = (slug: string): string | null => {
    const file = path.join(root, `${slug}${MDX_EXTENSION}`);
    if (!fs.existsSync(file)) return null;
    return fs.readFileSync(file, "utf8");
  };

  /** Compile frontmatter only — the body is not needed to build an index. */
  const metaOf = async (slug: string): Promise<T> => {
    const source = sourceOf(slug);
    // The slug came from readdir, so this is unreachable short of a concurrent
    // delete — fail loudly rather than parsing an empty document.
    if (source === null) throw new Error(`Missing MDX source: ${dir}/${slug}${MDX_EXTENSION}`);
    const { frontmatter } = await compileMDX({ source, options: { parseFrontmatter: true } });
    return schema.parse({ ...(frontmatter as Record<string, unknown>), slug });
  };

  /** Every entry's frontmatter, drafts included, newest first. */
  const allMeta = async (): Promise<T[]> => {
    const metas = await Promise.all(fileSlugs().map(metaOf));
    return metas.sort(byDateDesc);
  };

  const all = async (): Promise<T[]> => (await allMeta()).filter((meta) => !meta.draft);

  const publishedSlugs = async (): Promise<string[]> => (await all()).map((meta) => meta.slug);

  const routableSlugs = async (): Promise<string[]> =>
    DRAFTS_VISIBLE ? (await allMeta()).map((meta) => meta.slug) : publishedSlugs();

  const load = async (slug: string): Promise<LoadedEntry<T> | null> => {
    const source = sourceOf(slug);
    if (source === null) return null;
    const { content, frontmatter } = await compileMDX({
      source,
      options: { parseFrontmatter: true },
      components: mdxComponents,
    });
    const meta = schema.parse({ ...(frontmatter as Record<string, unknown>), slug });
    if (meta.draft && !DRAFTS_VISIBLE) return null;
    // Measured here, on the raw file, because after compileMDX the body is a
    // React tree and the word count would mean walking rendered elements.
    return { meta, content, readingMinutes: readingMinutes(source) };
  };

  const neighbours = async (slug: string): Promise<Neighbours<T>> => {
    const published = await all();
    const index = published.findIndex((meta) => meta.slug === slug);
    // -1 covers both a missing slug and a draft being previewed in dev: neither
    // sits in the published sequence, so neither has neighbours.
    if (index === -1) return { newer: null, older: null };
    // `all()` is newest-first, so the entry BEFORE this one in the array is the
    // one published later.
    return {
      newer: published[index - 1] ?? null,
      older: published[index + 1] ?? null,
    };
  };

  return { publishedSlugs, routableSlugs, all, load, neighbours };
}
