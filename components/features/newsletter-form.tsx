"use client";

import { buttonVariants } from "@/components/ui/button";

/**
 * NewsletterForm — email capture at the foot of Writing/Notes (never the hero).
 * Wired to Buttondown when NEXT_PUBLIC_BUTTONDOWN_USERNAME is set; otherwise it
 * renders an honest disabled state (no fake input that silently drops emails).
 * A11y: labelled input (visually-hidden label), real submit button with a
 * visible focus ring. The env var is inlined at build, so the branch is static.
 */
const BUTTONDOWN_USER = process.env.NEXT_PUBLIC_BUTTONDOWN_USERNAME;

export function NewsletterForm() {
  const enabled = Boolean(BUTTONDOWN_USER);

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
      {enabled ? (
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
      ) : (
        <p className="mt-5 inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-dashed border-border-strong px-3 py-2.5 font-mono text-xs text-ink-tertiary">
          <span className="h-1.5 w-1.5 rounded-full bg-ink-tertiary" aria-hidden />
          Sign-up opens once the list is connected.
        </p>
      )}
    </section>
  );
}
