import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

/**
 * Crawl rules. Everything public is open; two trees are closed:
 *   /api/  — dynamic endpoints with no indexable content (and /api/chat costs
 *            model quota per request, so crawlers must not touch it).
 *   /dev/  — the component kitchen sink, which is noindex by design.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/dev/"] },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
