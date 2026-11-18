import type { Metadata, Viewport } from "next";
import { Button } from "@/components/ui/button";
import { ErrorStage } from "@/components/misc/error-stage";
import { SmartLink } from "@/components/ui/smart-link";
import { NAV_ACTIONS, WORK_ITEMS } from "@/config/nav";
import { BROWSER_CHROME } from "@/constants/theme";
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

export const viewport: Viewport = { themeColor: BROWSER_CHROME.dark };

/** The quick routes back in, beside every case study. */
const QUICK_LINKS = [
  { label: "Work", href: "/work" },
  { label: "Writing", href: "/writing" },
  ...NAV_ACTIONS.filter((item) => item.href === "/contact"),
];

/**
 * 404 (dark, after the Clerk 404) — halftone digits in a dotted frame, the
 * message, the way home, and every work page (config/nav.ts WORK_ITEMS, so a new
 * case study is listed without an edit): a dead link is never a dead end.
 *
 * A11y: one h1 (the message); each link group is a named navigation.
 */
export default function NotFound() {
  const copy = pages.notFound;
  return (
    <ErrorStage
      digits="404"
      title={copy.title}
      lede={<p>{copy.lede}</p>}
      actions={
        <Button href="/" variant="grey" caret>
          Go to homepage
        </Button>
      }
    >
      <nav aria-label="Quick links" className="mt-10">
        <ul className="flex flex-wrap justify-center gap-2">
          {QUICK_LINKS.map((item) => (
            <li key={item.href}>
              <Button href={item.href} variant="ghost" size="sm">
                {item.label}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
      <nav aria-labelledby="nf-work" className="mt-8 w-full max-w-[760px] border-t border-border pt-6">
        <h2 id="nf-work" className="text-sm font-medium text-ink-tertiary">
          {copy.caseStudies}
        </h2>
        <ul className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-1">
          {WORK_ITEMS.map((item) => (
            <li key={item.slug}>
              <SmartLink
                href={item.href}
                className="inline-flex min-h-11 items-center text-sm text-ink-secondary transition-colors duration-[var(--motion-fast)] hover:text-ink"
              >
                {item.label}
              </SmartLink>
            </li>
          ))}
        </ul>
      </nav>
    </ErrorStage>
  );
}
