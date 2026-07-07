import { SITE } from "@/config/site";

/** Serialize a JSON-LD graph into an inert <script>. */
function LdScript({ data }: { data: unknown }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
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
