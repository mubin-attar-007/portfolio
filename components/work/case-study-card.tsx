import { renderOg } from "@/lib/og";
import { SITE } from "@/config/site";
import { flagshipBySlug, type FlagshipSlug } from "@/content/flagship";

/**
 * The social card of a case study, flagship or public.
 *
 * One alt for every case-study card. It was born on the dynamic route, where
 * `alt` is a static export and a per-page alt (generateImageMetadata) would move
 * each card to …/opengraph-image/<id>; the flagship routes share it so every
 * case study's card is described the same way. So it says what every card
 * prints rather than naming one project.
 */
export const CASE_STUDY_CARD_ALT = `Case study card from ${SITE.name}'s portfolio: the product's name, what kind of case study it is, and what it is in one line`;

/**
 * A flagship's card names the product and where it was built; its line is the
 * product's one-line definition, the same one its card on / and /work shows.
 */
export function flagshipCard(slug: FlagshipSlug) {
  const flagship = flagshipBySlug(slug);
  if (!flagship) throw new Error(`No flagship case study "${slug}"`);
  return renderOg({
    kicker: "Flagship case study · Sevina Technologies",
    title: flagship.name,
    description: flagship.definition,
  });
}
