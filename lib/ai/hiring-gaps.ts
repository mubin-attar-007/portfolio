// -----------------------------------------------------------------------------
// The assistant's fixed replies to a hiring term the site does not publish: a
// salary, relocation, a specific start date, a visa, a certification (lib/ai/intent.ts reads
// which one a question asks about). The chat handler follows a reply with what
// the site does say and the ways to reach Mubin; the home page's showcase
// quotes the replies as they are, so the two can never drift apart.
// -----------------------------------------------------------------------------

import { STATUS } from "@/config/site";
import type { HiringGap } from "./intent";

/**
 * What is missing, said first. A start date is not published, but his notice
 * period is, so that reply leads with it.
 */
export const GAP_OPENING: Readonly<Record<HiringGap, string>> = {
  compensation: "Salary and rates aren't on the site, so ask Mubin directly.",
  relocation: "Relocation isn't covered on the site, so ask Mubin directly.",
  "start-date": `His notice period is ${STATUS.noticePeriod}; for a specific start date, ask Mubin directly.`,
  visa: "Visa and sponsorship details aren't on the site, so ask Mubin directly.",
  // content/resume.ts lists none: test/chat-handler.test.mts fails if one is added.
  certification: "Certifications aren't on the site or his résumé, so ask Mubin directly if one matters for the role.",
};
