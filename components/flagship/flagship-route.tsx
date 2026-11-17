import type { Metadata } from "next";
import { flagshipNeighbourCards } from "@/components/work/work-neighbours";
import { flagshipBySlug, type Flagship, type FlagshipSlug } from "@/content/flagship";
import { pageMetadata } from "@/lib/seo";
import { FlagshipPage } from "./flagship-page";

/**
 * A flagship case study's route: app/work/bench-discovery and app/work/careltc
 * are each a static page that renders this. They are static routes rather than
 * slugs of /work/[slug] so that a public case study loads only its own
 * template's CSS and JavaScript, and a flagship only its own.
 */

function flagshipFor(slug: FlagshipSlug): Flagship {
  const flagship = flagshipBySlug(slug);
  if (!flagship) throw new Error(`No flagship case study "${slug}"`);
  return flagship;
}

/** The page's metadata: its canonical URL, title, description, card and date. */
export function flagshipMetadata(slug: FlagshipSlug): Metadata {
  const flagship = flagshipFor(slug);
  return pageMetadata({
    path: `/work/${slug}`,
    title: `${flagship.name} — case study`,
    description: flagship.summary,
    social: { title: `${flagship.name} · Flagship case study` },
    article: { modifiedTime: flagship.updated },
  });
}

/** The page: the flagship template, with its neighbours in the site's order of work. */
export function FlagshipRoute({ slug }: { slug: FlagshipSlug }) {
  const flagship = flagshipFor(slug);
  const { previous, next } = flagshipNeighbourCards(flagship);
  return <FlagshipPage flagship={flagship} previous={previous} next={next} />;
}
