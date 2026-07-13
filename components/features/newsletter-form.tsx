"use client";

import { buttonVariants } from "@/components/ui/button";
import { INTEGRATIONS } from "@/config/site";

/**
 * NewsletterForm — email capture at the foot of Writing/Notes (never the hero).
 * Wired to Buttondown when NEXT_PUBLIC_BUTTONDOWN_USERNAME is set; otherwise it
 * renders NOTHING — no placeholder/"coming soon" UI ever ships to prod (F-01).
 * Pages gate the whole block on NEWSLETTER_ENABLED so no empty wrapper remains.
 * A11y: labelled input (visually-hidden label), real submit button with a
 * visible focus ring. The env var is inlined at build, so the branch is static.
 */
const BUTTONDOWN_USER = process.env.NEXT_PUBLIC_BUTTONDOWN_USERNAME ?? INTEGRATIONS.buttondownUsername;

/** True only when the list is actually connected. Pages import this to gate the block. */
export const NEWSLETTER_ENABLED = Boolean(BUTTONDOWN_USER);

export function NewsletterForm() {
  // No placeholder UI on prod: render nothing until the list is connected.
  if (!NEWSLETTER_ENABLED) return null;

  return (
    <section
      aria-label="Newsletter"
      className="rounded-[var(--radius-md)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]"
    >
      <h2 className="text-base font-medium text-ink">New writing, occasionally.</h2>
      <p className="mt-2 max-w-[52ch] text-sm text-ink-secondary">
        The odd essay or note when I ship something worth reading — no cadence, no spam, unsubscribe
        in one click.
      </p>
      <form
        action={`https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USER}`}
        method="post"
        target="_blank"
        className="mt-5 flex flex-col gap-3 sm:flex-row"
      >
        <label htmlFor="bd-email" className="sr-only">
          Email address
        </label>
        <input
          id="bd-email"
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
          className="min-w-0 flex-1 rounded-[var(--radius-md)] border border-border-strong bg-bg px-3 py-2 text-sm text-ink transition-colors placeholder:text-ink-tertiary focus-visible:border-accent"
        />
        <button type="submit" className={buttonVariants("primary", "sm")}>
          Subscribe
        </button>
      </form>
    </section>
  );
}
