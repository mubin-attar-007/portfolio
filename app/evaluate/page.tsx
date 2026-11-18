import type { Metadata, Viewport } from "next";
import { Container } from "@/components/layout/container";
import { DarkSurface } from "@/components/layout/dark-surface";
import { EvaluateCta, EvaluateHero, PrivacySteps, PromptCards, ReadsGrid } from "@/components/evaluate/evaluate-sections";
import { BROWSER_CHROME } from "@/constants/theme";
import { evaluatePage } from "@/content/pages/evaluate";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/evaluate",
  title: evaluatePage.meta.title,
  description: evaluatePage.meta.description,
});

export const viewport: Viewport = { themeColor: BROWSER_CHROME.dark };

/**
 * /evaluate — check my work with your own AI (a dark page, after Clerk's MCP
 * page): the mark over falling lines with the prompt to copy and llms.txt →
 * prompts to try, each copying a whole prompt → what the AI reads → the
 * privacy points → ask here instead. Copy in content/pages/evaluate.ts.
 *
 * A11y: one h1; every block is a section named by its heading; the falling
 * lines are decorative, with a pause button, and still under reduced motion.
 */
export default function EvaluatePage() {
  return (
    <DarkSurface>
      <EvaluateHero />
      <Container>
        <PromptCards />
        <ReadsGrid />
        <PrivacySteps />
        <EvaluateCta />
      </Container>
    </DarkSurface>
  );
}
