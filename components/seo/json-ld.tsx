import { SITE } from "@/config/site";

type ProjectLinkMap = {
  live?: string;
  repo?: string;
};

/** Serialize a JSON-LD graph into an inert <script>. */
function LdScript({ data }: { data: unknown }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

function yearFromTimeline(timeline: string): string | undefined {
  const match = timeline.match(/\b(19|20)\d{2}\b/);
  return match ? `${match[0]}-01-01` : undefined;
}

function safeIsoDate(value?: string): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? undefined : parsed.toISOString().slice(0, 10);
}

/**
 * ArticleJsonLd — BlogPosting structured data for a writing post, authored by
 * the site's Person node. Rendered on each /writing/[slug] page.
 */
export function ArticleJsonLd({
  title,
  description,
  url,
  datePublished,
  dateModified,
}: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
}) {
  return (
    <LdScript
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        description,
        url,
        mainEntityOfPage: url,
        datePublished,
        dateModified: dateModified ?? datePublished,
        author: { "@type": "Person", name: SITE.name, url: SITE.url },
        publisher: { "@id": `${SITE.url}/#person` },
        inLanguage: "en",
      }}
    />
  );
}

/**
 * ProjectJsonLd — CreativeWork structured data for a case-study page.
 * Kept lightweight and factual: only fields that map to verifiable source
 * values are emitted, with timeline fallback for dates.
 */
export function ProjectJsonLd({
  title,
  description,
  url,
  timeline,
  role,
  systems,
  links,
  changelog,
}: {
  title: string;
  description: string;
  url: string;
  timeline: string;
  role: string;
  systems: string[];
  links: ProjectLinkMap;
  changelog?: { date: string; summary: string }[];
}) {
  const dateCreated = yearFromTimeline(timeline);
  const dateModified = safeIsoDate(changelog?.[0]?.date) ?? dateCreated;

  return (
    <LdScript
      data={{
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "@id": url,
        name: title,
        description,
        url,
        inLanguage: "en",
        keywords: systems.join(", "),
        text: role,
        author: {
          "@type": "Person",
          "@id": `${SITE.url}/#person`,
          name: SITE.name,
          url: SITE.url,
        },
        creator: {
          "@type": "Person",
          "@id": `${SITE.url}/#person`,
          name: SITE.name,
          url: SITE.url,
        },
        dateCreated,
        dateModified,
        sameAs: [links.live, links.repo].filter(Boolean),
      }}
    />
  );
}

/**
 * Structured data (schema.org) — a Person + WebSite graph so search engines and
 * assistants can resolve who this site is about. Grounded in real facts only
 * (name, role, socials, location); no invented claims. Rendered once in the
 * root layout. A11y: inert <script>, no visual output.
 */
export function JsonLd() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE.url}/#person`,
        name: SITE.name,
        jobTitle: SITE.role,
        url: SITE.url,
        email: `mailto:${SITE.email}`,
        address: { "@type": "PostalAddress", addressLocality: SITE.location },
        sameAs: [SITE.socials.github, SITE.socials.linkedin, SITE.socials.huggingface],
        knowsAbout: [
          "Artificial Intelligence",
          "Machine Learning",
          "Large Language Models",
          "Retrieval-Augmented Generation",
          "LLM agents",
          "Python",
          "TypeScript",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE.url}/#website`,
        url: SITE.url,
        name: `${SITE.name} — ${SITE.role}`,
        publisher: { "@id": `${SITE.url}/#person` },
        inLanguage: "en",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Structured data is inert; JSON is serialized, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
