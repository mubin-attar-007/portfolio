import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { writingSlugs } from "@/lib/writing";
import { SITE } from "@/config/site";

/** Every indexable route: the static pages, each case study, each essay. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const u = (path: string) => `${SITE.url}${path}`;

  const staticRoutes: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/work", priority: 0.9 },
    { path: "/writing", priority: 0.7 },
    { path: "/about", priority: 0.6 },
    { path: "/timeline", priority: 0.6 },
    { path: "/resume", priority: 0.6 },
  ];

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
    ...writingSlugs().map((slug) => ({
      url: u(`/writing/${slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
