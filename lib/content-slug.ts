import path from "node:path";

/**
 * The only shape a content slug may take: one lowercase, kebab-case path
 * segment — what every file name in content/writing and content/notes already
 * is. It admits no dot, slash, backslash, percent sign, colon or whitespace, so
 * a slug can never name a parent directory or an absolute path, however a URL
 * encoded it (Next decodes a dynamic segment once before the route sees it).
 */
export const CONTENT_SLUG = /^[a-z0-9-]+$/;

/**
 * The absolute path of `<root>/<slug><extension>`, or `null` when `slug` is not
 * a content slug or the file would resolve outside `root`. Callers treat `null`
 * as "no such entry", so a hostile URL becomes a 404, never a file read.
 */
export function contentFilePath(root: string, slug: string, extension: string): string | null {
  if (!CONTENT_SLUG.test(slug)) return null;
  // Joined first, then resolved: `path.resolve` over the template literal makes
  // Turbopack's output-file tracer copy every file beside this module into the
  // server bundle.
  const file = path.resolve(path.join(root, `${slug}${extension}`));
  // Defence in depth. The pattern already rules out every separator and dot
  // segment, so this check only matters if the pattern is ever loosened.
  const base = path.resolve(root);
  const inside = base.endsWith(path.sep) ? base : `${base}${path.sep}`;
  return file.startsWith(inside) ? file : null;
}
