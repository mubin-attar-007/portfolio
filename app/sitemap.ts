import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { allWriting } from "@/lib/writing";
import { allNotes } from "@/lib/notes";
import { SITE } from "@/config/site";

function asDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? undefined : parsed;
}

function latestDate(values: readonly (Date | undefined)[]): Date | undefined {
  const valid = values.filter((value): value is Date => value !== undefined);
  if (valid.length === 0) return undefined;
  return new Date(Math.max(...valid.map((value) => value.valueOf())));
}

type SitemapEntry = MetadataRoute.Sitemap[number];

function entry(
  url: string,
  priority: number,
  changeFrequency: NonNullable<SitemapEntry["changeFrequency"]>,
  lastModified?: Date,
): SitemapEntry {
  return {
    url,
    priority,
    changeFrequency,
    ...(lastModified ? { lastModified } : {}),
  };
}

/**
 * Every indexable route: the static pages, each case study, essay, and note.
 * Draft entries are excluded — a sitemap is an invitation to crawl, so it must
 * never advertise a URL that isn't published. `lastModified` is emitted only
 * when content provides an honest date; a build timestamp is not a content
 * change and would send false freshness signals to crawlers.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [writing, notes] = await Promise.all([allWriting(), allNotes()]);
  const u = (path: string) => `${SITE.url}${path}`;

  const projectModified = projects.map((project) =>
    latestDate(project.changelog.map((change) => asDate(change.date))),
  );
  const writingModified = writing.map(
    (post) => asDate(post.updated) ?? asDate(post.date),
  );
  const noteModified = notes.map((note) => asDate(note.date));

  const latestProject = latestDate(projectModified);
  const latestWriting = latestDate(writingModified);
  const latestNote = latestDate(noteModified);
  const latestPublishedContent = latestDate([
    latestProject,
    latestWriting,
    latestNote,
  ]);

  const staticRoutes: SitemapEntry[] = [
    entry(u(""), 1, "weekly", latestPublishedContent),
    entry(u("/work"), 0.9, "monthly", latestProject),
    entry(u("/writing"), 0.7, "weekly", latestWriting),
    entry(u("/notes"), 0.7, "weekly", latestNote),
    entry(u("/now"), 0.6, "monthly"),
    entry(u("/evals"), 0.6, "monthly"),
    entry(u("/hire"), 0.7, "monthly"),
    entry(u("/about"), 0.6, "yearly"),
    entry(u("/timeline"), 0.6, "monthly"),
    entry(u("/uses"), 0.5, "monthly"),
    entry(u("/trust"), 0.55, "monthly"),
    entry(u("/changelog"), 0.55, "monthly"),
    entry(u("/resume"), 0.6, "monthly"),
    entry(u("/skills"), 0.58, "monthly"),
    entry(u("/privacy"), 0.3, "yearly"),
  ];

  return [
    ...staticRoutes,
    ...projects.map((project, index) =>
      entry(
        u(`/work/${project.slug}`),
        0.8,
        "monthly",
        projectModified[index],
      ),
    ),
    ...writing.map((post, index) =>
      entry(
        u(`/writing/${post.slug}`),
        0.6,
        "monthly",
        writingModified[index],
      ),
    ),
    ...notes.map((note, index) =>
      entry(u(`/notes/${note.slug}`), 0.5, "monthly", noteModified[index]),
    ),
  ];
}
