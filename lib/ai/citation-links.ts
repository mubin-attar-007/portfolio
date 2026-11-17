import type { Citation, CitationLink } from "./chat-contract";

/**
 * The projects a source label can name. Duplicated from content/projects.ts on
 * purpose: this module also runs in the panel, a client component, which may
 * not import content (ARCHITECTURE.md §5). test/assistant-citations.test.mts
 * fails if a project in the registry is missing here.
 */
const PROJECTS = [
  { name: "DBWhisper", slug: "dbwhisper" },
  { name: "LLM Studio", slug: "llm-studio" },
  { name: "TradePulse", slug: "tradepulse" },
  { name: "CrownWager", slug: "crownwager" },
] as const;

/**
 * Every page shape a citation may point to: a case study, an essay, a note, or
 * one of the fixed profile pages, optionally with an in-page anchor. Links are
 * built on the server from the corpus, never from model output, and the panel
 * checks each one against this pattern again before rendering it, so even a
 * tampered response can only ever name a page of this site.
 */
const SITE_PATH =
  /^\/(?:(?:work|writing|notes)\/[a-z0-9-]+|work|writing|notes|evals|hire|contact|resume|about|skills)(?:#[a-z0-9-]+)?$/;

/** Longest link label the panel renders; anything longer is not one of ours. */
const MAX_LABEL_CHARS = 120;

/** Longest source line the panel renders. */
const MAX_SOURCE_CHARS = 200;

/** Most citations one answer shows; the route sends at most four. */
const MAX_CITATIONS = 8;

/** True when `href` is a page of this site that a citation may link to. */
export function isSitePath(href: string): boolean {
  return SITE_PATH.test(href);
}

/**
 * Resolve a human-readable source label to known site pages. Multi-project
 * labels expose every named case study. Unknown labels stay unlinked; model
 * output and arbitrary URLs can never become link targets.
 */
export function citationLinks(source: string): CitationLink[] {
  const links: CitationLink[] = [];
  for (const project of PROJECTS) {
    if (source.toLowerCase().includes(project.name.toLowerCase())) {
      links.push({ label: project.name, href: `/work/${project.slug}` });
    }
  }
  if (/projects \(all four\)/i.test(source)) {
    links.push({ label: "Selected work", href: "/work" });
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
 * Show each page once per answer. A turn that cites three sections of one case
 * study keeps all three source lines, but only the first carries the link —
 * three identical "DBWhisper" links in a row read as noise, not as evidence.
 */
export function dedupeCitationLinks(citations: readonly Citation[]): Citation[] {
  const seen = new Set<string>();
  return citations.map((citation) => {
    const links = citation.links.filter((link) => {
      if (seen.has(link.href)) return false;
      seen.add(link.href);
      return true;
    });
    return { source: citation.source, links };
  });
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
 * Read the `sources` event of a response into citations the panel can render.
 * Malformed entries are dropped rather than blanking the list. A citation sent
 * without links (an older response shape) is resolved from its label.
 */
export function readCitations(value: unknown): Citation[] {
  if (!Array.isArray(value)) return [];
  const citations: Citation[] = [];
  for (const item of value.slice(0, MAX_CITATIONS)) {
    if (typeof item !== "object" || item === null) continue;
    const { source, links: raw } = item as { source?: unknown; links?: unknown };
    if (typeof source !== "string") continue;
    const label = source.trim();
    if (!label || label.length > MAX_SOURCE_CHARS) continue;
    const links = Array.isArray(raw)
      ? raw.map(readLink).filter((link): link is CitationLink => link !== null)
      : citationLinks(label);
    citations.push({ source: label, links });
  }
  return dedupeCitationLinks(citations);
}
