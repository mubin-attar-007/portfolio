import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/ui/page-header";
import { ContactCard } from "@/components/contact/contact-card";
import { contactPage } from "@/content/pages/contact";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/contact",
  title: contactPage.meta.title,
  description: contactPage.meta.description,
});

/**
 * /contact — the contact funnel (spec/prototype/contact.html, Clerk Contact).
 * The page header, then one card with the two routes in and three ways to
 * check the work first. /hire stays the careers-style page and links here.
 */
export default function ContactPage() {
  const { kicker, title, lede } = contactPage.header;
  return (
    <>
      <Section space="head">
        <PageHeader kicker={kicker} title={title} lede={lede} />
      </Section>
      <ContactCard />
    </>
  );
}
