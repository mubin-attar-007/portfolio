import { WritingSchema, type WritingMeta } from "@/content/schema";
import { createMdxCollection } from "@/lib/mdx-collection";

/**
 * The essays and guides in content/writing. Thin binding of the shared MDX
 * collection loader to this collection's directory and schema — draft handling,
 * validation, and sorting all live in lib/mdx-collection.ts.
 */
const writing = createMdxCollection<WritingMeta>("content/writing", WritingSchema);

/** Slugs of published essays, newest first. Excludes drafts everywhere. */
export const publishedWritingSlugs = writing.publishedSlugs;

/** Slugs that should resolve to a page — adds drafts in development only. */
export const routableWritingSlugs = writing.routableSlugs;

/** Published writing, newest first. Zod validates each — build fails on bad frontmatter. */
export const allWriting = writing.all;

/** Compile one essay, or null if it is missing or an unpublished draft. */
export const loadWriting = writing.load;

/** The published essays either side of one slug, for the end-of-article footer. */
export const writingNeighbours = writing.neighbours;
