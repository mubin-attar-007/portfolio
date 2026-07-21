import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { publishedWritingSlugs } from "@/lib/writing";
import { publishedNoteSlugs } from "@/lib/notes";
import { SITE } from "@/config/site";

/**
 * Every indexable route: the static pages, each case study, essay, and note.
 * Draft entries are excluded — a sitemap is an invitation to crawl, so it must
 * never advertise a URL that isn't published.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const u = (path: string) => `${SITE.url}${path}`;

  const staticRoutes: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/work", priority: 0.9 },
    { path: "/writing", priority: 0.7 },
    { path: "/notes", priority: 0.7 },
    { path: "/now", priority: 0.6 },
    { path: "/evals", priority: 0.6 },
    { path: "/hire", priority: 0.7 },
    { path: "/about", priority: 0.6 },
    { path: "/timeline", priority: 0.6 },
    { path: "/uses", priority: 0.5 },
    { path: "/trust", priority: 0.55 },
    { path: "/changelog", priority: 0.55 },
    { path: "/talks", priority: 0.5 },
    { path: "/resume", priority: 0.6 },
  ];

  const [writing, notes] = await Promise.all([publishedWritingSlugs(), publishedNoteSlugs()]);

  return [
    ...staticRoutes.map((r) => ({
      url: u(r.path),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: r.priority,
    })),
    ...projects.map((p) => ({
      url: u(`/work/${p.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...writing.map((slug) => ({
      url: u(`/writing/${slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...notes.map((slug) => ({
      url: u(`/notes/${slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
