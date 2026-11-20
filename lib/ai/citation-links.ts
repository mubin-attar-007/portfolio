import type { CitationLink } from "./chat-contract";

/**
 * The products and projects a source label can name. Duplicated from
 * content/flagship and content/projects.ts on purpose: this module also runs
 * in the panel, a client component, which may not import content
 * (ARCHITECTURE.md §5). test/assistant-citations.test.mts fails if a product
 * or project in the registries is missing here.
 */
const PROJECTS = [
  { name: "Bench Discovery", slug: "bench-discovery" },
  { name: "CareLTC", slug: "careltc" },
  { name: "SignFlow", slug: "signflow" },
  { name: "DBWhisper", slug: "dbwhisper" },
  { name: "TradePulse", slug: "tradepulse" },
] as const;

/**
 * Every page shape a citation may point to: a case study, an essay, a note, or
 * one of the fixed pages, optionally with an in-page anchor. Links are built
 * on the server from the corpus, never from model output, and the panel checks
 * each one against this pattern again before rendering it, so even a tampered
 * response can only ever name a page of this site. The home page is not a
 * citation: it summarizes pages that are each cited in their own right.
 */
const SITE_PATH =
  /^\/(?:(?:work|writing|notes)\/[a-z0-9-]+|work|writing|notes|evals|hire|contact|resume|about|skills|uses|now|trust|evaluate|privacy)(?:#[a-z0-9-]+)?$/;

/** Longest link label the panel renders; anything longer is not one of ours. */
const MAX_LABEL_CHARS = 120;

/** Most pages one answer cites; the route sends at most one per cited passage. */
const MAX_CITATIONS = 8;

/** True when `href` is a page of this site that a citation may link to. */
export function isSitePath(href: string): boolean {
  return SITE_PATH.test(href);
}

/** A site path without its in-page anchor: "/evals#x" → "/evals". */
export const pagePath = (href: string): string => href.split("#", 1)[0]!;

/**
 * Resolve an FAQ answer's source label to the site pages it names. A label
 * that names several projects exposes every case study it names. Unknown
 * labels stay unlinked; model output and arbitrary URLs can never become
 * link targets.
 */
export function citationLinks(source: string): CitationLink[] {
  const links: CitationLink[] = [];
  for (const project of PROJECTS) {
    if (source.toLowerCase().includes(project.name.toLowerCase())) {
      links.push({ label: project.name, href: `/work/${project.slug}` });
    }
  }
  if (/\bpublic projects\b/i.test(source)) {
    links.push({ label: "Work", href: "/work" });
  }
  if (/résumé|resume|education|sevina|linescripts|roles?\b/i.test(source)) {
    links.push({ label: "Résumé", href: "/resume" });
  }
  if (/\bprofile\b|about narrative/i.test(source)) {
    links.push({ label: "About Mubin", href: "/about" });
  }
  if (/\bskills\b/i.test(source)) {
    links.push({ label: "Skills", href: "/skills" });
  }
  if (/^contact\b/i.test(source)) {
    links.push({ label: "Contact", href: "/contact" });
  }
  if (/^evaluations?\b/i.test(source)) {
    links.push({ label: "Evals", href: "/evals" });
  }
  if (/\bprivacy\b/i.test(source)) {
    links.push({ label: "Privacy", href: "/privacy" });
  }
  return links;
}

/**
 * Merge link lists in order, keeping the first link for each page and dropping
 * anything that is not a page of this site.
 */
export function mergeLinks(...lists: readonly (readonly CitationLink[])[]): CitationLink[] {
  const seen = new Set<string>();
  const merged: CitationLink[] = [];
  for (const list of lists) {
    for (const link of list) {
      if (!isSitePath(link.href) || seen.has(link.href)) continue;
      seen.add(link.href);
      merged.push(link);
    }
  }
  return merged;
}

/**
 * The pages an answer cites, each once: one chip per page, whatever the
 * number of its sections the answer drew on. The first section's anchor is
 * kept ("/work/careltc#what-broke"), so the chip opens where the answer came
 * from; a later section of the same page adds nothing.
 */
export function citedPages(lists: readonly (readonly CitationLink[])[]): CitationLink[] {
  const seen = new Set<string>();
  const pages: CitationLink[] = [];
  for (const link of lists.flat()) {
    const page = pagePath(link.href);
    if (!isSitePath(link.href) || seen.has(page)) continue;
    seen.add(page);
    pages.push(link);
  }
  return pages.slice(0, MAX_CITATIONS);
}

/** One untrusted link from a response, or null if it is not one of ours. */
function readLink(value: unknown): CitationLink | null {
  if (typeof value !== "object" || value === null) return null;
  const { label, href } = value as { label?: unknown; href?: unknown };
  if (typeof label !== "string" || typeof href !== "string") return null;
  const trimmed = label.trim();
  if (!trimmed || trimmed.length > MAX_LABEL_CHARS || !isSitePath(href)) return null;
  return { label: trimmed, href };
}

/**
 * Read the `sources` event of a response into the pages the panel renders.
 * Malformed entries are dropped rather than blanking the list. An entry in the
 * older shape — a source line with its links, `{ source, links }` — is read
 * as its links, or resolved from its label when it carries none, so a cached
 * response or a test double still renders as pages, never as a bare label.
 */
export function readCitations(value: unknown): CitationLink[] {
  if (!Array.isArray(value)) return [];
  const lists: CitationLink[][] = [];
  for (const item of value.slice(0, MAX_CITATIONS)) {
    if (typeof item !== "object" || item === null) continue;
    const page = readLink(item);
    if (page) {
      lists.push([page]);
      continue;
    }
    const { source, links } = item as { source?: unknown; links?: unknown };
    if (Array.isArray(links)) lists.push(links.map(readLink).filter((link): link is CitationLink => link !== null));
    else if (typeof source === "string") lists.push(citationLinks(source.trim()));
  }
  return citedPages(lists);
}
