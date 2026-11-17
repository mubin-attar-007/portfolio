import type { Metadata } from "next";
import { SITE } from "@/config/site";
import { SEO_LIMITS } from "@/constants/seo";

/**
 * Page metadata, built one way for every route.
 *
 * Next merges metadata SHALLOWLY: a page that sets `openGraph` or `alternates`
 * replaces the root layout's object whole. A canonical URL or an og:url in the
 * root layout was therefore inherited by every page that set neither — the 404
 * and /dev/components declared the homepage canonical — while every page that
 * set its own lost the root's og:locale and RSS discovery. So the root layout
 * sets only defaults that are true of any page, and each page states its own
 * URL through `pageMetadata`. Checked on every sitemap URL by the metadata gate
 * (`npm run test:metadata`).
 */

/** What the root layout's title template appends to a page title. */
export const TITLE_SUFFIX = ` · ${SITE.name}`;

/** The language every page is written in. */
export const OG_LOCALE = "en_US";

/** A feed a page advertises for RSS autodiscovery. */
export type Feed = { url: string; title: string };

/** The combined writing-and-notes feed, advertised on every page. */
export const SITE_FEED: Feed = { url: `${SITE.url}/rss.xml`, title: `${SITE.name} — Writing & Notes` };

/** The absolute URL of a site path; "/" is the homepage. */
export function absoluteUrl(path: string): string {
  return `${SITE.url}${path}`;
}

/**
 * A page title for the root template ("%s · Mubin Attar"). When the suffixed
 * title would pass what a results page shows, the suffix is dropped instead,
 * so the page's own name is never the part that gets cut.
 */
export function documentTitle(title: string): string | { absolute: string } {
  return `${title}${TITLE_SUFFIX}`.length > SEO_LIMITS.titleMax ? { absolute: title } : title;
}

/** The facts an essay, note, or case study adds to its social card. */
export type ArticleFacts = {
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
};

export type PageMetadataInput = {
  /** The page's path ("/about"; "/" for the homepage): its canonical URL and og:url. */
  path: string;
  /**
   * The page's name. A string goes through the root template; `{ absolute }`
   * is already the whole title (the homepage's brand line).
   */
  title: string | { absolute: string };
  /** The search description: 50–160 characters, checked by the metadata gate. */
  description: string;
  /** The social card's own title or description, where it reads differently. */
  social?: { title?: string; description?: string };
  /** An essay, note, or case study: og:type "article" with its dates and tags. */
  article?: ArticleFacts;
  /** Feeds advertised besides the site feed (the /writing index adds its own). */
  feeds?: readonly Feed[];
};

/**
 * Metadata for one public page: title, description, canonical URL, RSS
 * discovery, and a complete social card (site name, locale, URL, type).
 *
 * The card's title names the page and the person on an index page ("Work —
 * Mubin Attar"); an article's card is titled by the article alone, since
 * og:site_name already names the site. The twitter card inherits all of it.
 */
export function pageMetadata({
  path,
  title,
  description,
  social,
  article,
  feeds = [],
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const card = {
    siteName: SITE.name,
    locale: OG_LOCALE,
    url,
    description: social?.description ?? description,
  };
  const name = typeof title === "string" ? title : title.absolute;
  const cardTitle = social?.title ?? (typeof title === "string" && !article ? `${name} — ${SITE.name}` : name);

  return {
    title: typeof title === "string" ? documentTitle(title) : title,
    description,
    alternates: {
      canonical: url,
      types: { "application/rss+xml": [SITE_FEED, ...feeds] },
    },
    openGraph: article
      ? { ...card, type: "article", title: cardTitle, authors: [SITE.name], ...article }
      : { ...card, type: "website", title: cardTitle },
  };
}
