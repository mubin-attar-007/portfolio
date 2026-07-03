import type { MetadataRoute } from "next";
import { caseStudySlugs } from "@/lib/case-studies";

const SITE = "https://mubin-attar.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE}/work`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...caseStudySlugs.map((slug) => ({
      url: `${SITE}/work/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
