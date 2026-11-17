import { NoteSchema, type NoteMeta } from "@/content/schema";
import { fitDescription } from "@/lib/excerpt";
import { createMdxCollection, type Entry } from "@/lib/mdx-collection";

/**
 * The short notes in content/notes. Thin binding of the shared MDX collection
 * loader to this collection's directory and schema — draft handling,
 * validation, and sorting all live in lib/mdx-collection.ts.
 */
const notes = createMdxCollection<NoteMeta>("notes", NoteSchema);

/** Slugs that should resolve to a page — adds drafts in development only. */
export const routableNoteSlugs = notes.routableSlugs;

/** Published notes, newest first. Zod validates each — build fails on bad frontmatter. */
export const allNotes = notes.all;

/** Compile one note, or null if it is missing or an unpublished draft. */
export const loadNote = notes.load;

/** The published notes either side of one slug, for the end-of-article footer. */
export const noteNeighbours = notes.neighbours;

/**
 * A note's description for search results, its social card, its structured
 * data, and the feeds: the author's `summary` when the note has one, otherwise
 * its opening sentences, cut where a sentence ends (lib/excerpt.ts).
 */
export function noteDescription(note: Pick<Entry<NoteMeta>, "summary" | "excerpt">): string {
  return note.summary ?? fitDescription(note.excerpt);
}
