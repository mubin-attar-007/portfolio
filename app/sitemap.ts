import type { MetadataRoute } from "next";
import { caseStudySlugs } from "@/lib/case-studies";
import { SITE, url } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: url("/work"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...caseStudySlugs.map((slug) => ({
      url: url(`/work/${slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
