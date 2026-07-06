import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Writing",
  description: "Essays, guides, and notes on AI systems, evaluation, and honest ML.",
  alternates: { canonical: `${SITE.url}/writing` },
};

export default function WritingPage() {
  return (
    <Section space="lg">
      <p className="font-mono text-xs uppercase text-ink-tertiary">Writing</p>
      <h1 className="mt-6 max-w-[20ch] text-4xl text-ink sm:text-5xl">Writing</h1>
      <p className="mt-6 max-w-[var(--width-prose)] text-lg text-ink-secondary">
        Essays and guides are in progress — mined from the decision logs and failures in my case
        studies (why a deterministic validator beat trusting the model, what broke in v1, and how I
        evaluate a grounded assistant). Check back soon.
      </p>
    </Section>
  );
}
