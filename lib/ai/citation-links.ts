/** A known public page where a reader can check an assistant source. */
export type CitationLink = { label: string; href: string };

const PROJECTS = [
  { name: "DBWhisper", slug: "dbwhisper" },
  { name: "LLM Studio", slug: "llm-studio" },
  { name: "TradePulse", slug: "tradepulse" },
  { name: "CrownWager", slug: "crownwager" },
] as const;

/**
 * Resolve the retrieval API's human-readable sources to known site pages.
 * Multi-project citations expose every named case study. Unknown labels stay
 * unlinked; model output and arbitrary URLs can never become link targets.
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
  return links;
}
