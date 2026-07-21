import { NoteSchema, type NoteMeta } from "@/content/schema";
import { createMdxCollection } from "@/lib/mdx-collection";

/**
 * The short notes in content/notes. Thin binding of the shared MDX collection
 * loader to this collection's directory and schema — draft handling,
 * validation, and sorting all live in lib/mdx-collection.ts.
 */
const notes = createMdxCollection<NoteMeta>("content/notes", NoteSchema);

/** Slugs of published notes, newest first. Excludes drafts everywhere. */
export const publishedNoteSlugs = notes.publishedSlugs;

/** Slugs that should resolve to a page — adds drafts in development only. */
export const routableNoteSlugs = notes.routableSlugs;

/** Published notes, newest first. Zod validates each — build fails on bad frontmatter. */
export const allNotes = notes.all;

/** Compile one note, or null if it is missing or an unpublished draft. */
export const loadNote = notes.load;

/** The published notes either side of one slug, for the end-of-article footer. */
export const noteNeighbours = notes.neighbours;
