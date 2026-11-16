import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { NAV } from "@/config/nav";
import { LABEL, PAGE_BODY_BAND, PAGE_HEADER_BAND } from "@/constants/page";
import { projects } from "@/content/projects";
import { pages } from "@/content/site";

/**
 * A missing page has no canonical URL and no social card of its own: `null`
 * clears the root layout's defaults instead of letting the 404 describe some
 * other page, and `noindex` keeps it out of results while `follow` lets
 * crawlers continue through its links.
 */
export const metadata: Metadata = {
  title: "Page not found",
  description: "The page could not be found. Use one of these routes to continue.",
  robots: { index: false, follow: true },
  alternates: null,
  openGraph: null,
};

/**
 * 404 — the shared page header, then the routes back in: home, the primary
 * navigation, and every case study (from content/projects.ts, so a new project
 * is listed here without an edit). Never a dead end.
 *
 * A11y: the page's one h1 comes from PageHeader; the case-study group is an h2.
 * Every link is a TextLink — a real link with its label as its name and a
 * 44px target.
 */
export default function NotFound() {
  const copy = pages.notFound;
  return (
    <>
      <Section space="lg" className={PAGE_HEADER_BAND}>
        <PageHeader kicker={copy.kicker} title={copy.title} lede={copy.lede}>
          <TextLink href="/">{copy.home}</TextLink>
          {NAV.map((item) => (
            <TextLink key={item.href} href={item.href}>
              {item.label}
            </TextLink>
          ))}
        </PageHeader>
      </Section>
      <Section space="md" className={PAGE_BODY_BAND}>
        <h2 className={LABEL}>{copy.caseStudies}</h2>
        <ul className="mt-2 flex flex-wrap gap-x-6">
          {projects.map((project) => (
            <li key={project.slug}>
              <TextLink href={`/work/${project.slug}`} tone="quiet">
                {project.title}
              </TextLink>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
