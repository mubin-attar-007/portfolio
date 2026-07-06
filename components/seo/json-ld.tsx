import { SITE } from "@/config/site";

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
