import type { Metadata } from "next";
import { RuleX, DotBand } from "@/components/ui/blueprint";
import { HireHero } from "@/components/hire/hire-hero";
import { HireLetter } from "@/components/hire/hire-letter";
import { HireGlance } from "@/components/hire/hire-glance";
import { HirePerks } from "@/components/hire/hire-perks";
import { HireRoles } from "@/components/hire/hire-roles";
import { SITE } from "@/config/site";
import { hirePage } from "@/content/pages/hire";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/hire",
  title: hirePage.meta.title,
  description: hirePage.meta.description,
  social: { title: `Hire ${SITE.name}` },
});

/**
 * /hire — the careers-style page (spec/prototype/hire.html, Clerk Careers).
 *
 * Glass-mark hero → the letter to hiring teams → "At a glance" figures →
 * "Working with me" perks → the roles I'm open to (#roles). The contact
 * funnel itself lives on /contact; every action here points there, except the
 * freelance row, which books a call.
 *
 * The blocks sit in one blueprint frame (hairline side rules), separated by
 * fading rules and dot bands, so the page reads as one document.
 */
export default function HirePage() {
  return (
    <>
      <HireHero />
      <HireLetter />
      <RuleX />
      <HireGlance />
      <DotBand />
      <HirePerks />
      <RuleX />
      <HireRoles />
    </>
  );
}
