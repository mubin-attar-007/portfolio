/**
 * Site config — the ONLY place outside `content/` where copy may live
 * (name, role, canonical URL, socials). Headline/bio live in content/site/.
 */
export const SITE = {
  name: "Mubin Attar",
  role: "AI/ML Engineer",
  url: "https://mubin-attar.vercel.app",
  email: "sk.mubinattar@gmail.com",
  location: "Ahmedabad, India",
  socials: {
    github: "https://github.com/mubin-attar-007",
    linkedin: "https://www.linkedin.com/in/mubin-attar-53223716a",
    huggingface: "https://huggingface.co/heisenbergblue",
  },
} as const;

export type Site = typeof SITE;

/** The slim top status bar (site chrome — evergreen, not an announcement). */
export const STATUS = {
  text: "Open to AI/ML roles — remote or Ahmedabad, India",
  cta: "Get in touch",
  href: `mailto:${SITE.email}`,
} as const;
