import { buttonVariants } from "@/components/ui/button";

/**
 * NewsletterForm — email capture at the foot of Writing/Notes (never the hero).
 *
 * Off by default. It renders only when NEXT_PUBLIC_BUTTONDOWN_USERNAME names
 * the Buttondown account to post to — one setting, with no committed default,
 * so the form cannot reach visitors before the owner has confirmed the list
 * delivers (hidden on 2026-11-16 until that is checked). Unset, empty, or not a
 * plain handle: it renders NOTHING — no placeholder/"coming soon" UI ever ships
 * to prod (F-01). Pages gate the whole block on NEWSLETTER_ENABLED so no empty
 * wrapper remains.
 *
 * A11y: labelled input (visually-hidden label), real submit button with a
 * visible focus ring. This is intentionally a Server Component: the browser's
 * native form submission provides the full interaction, so shipping a React
 * client boundary here would add hydration work without adding capability.
 */
const configuredHandle = process.env.NEXT_PUBLIC_BUTTONDOWN_USERNAME?.trim() ?? "";

/** The account the form posts to. Only a plain handle counts, so the action URL stays a path segment. */
const BUTTONDOWN_USER = /^[A-Za-z0-9_-]+$/.test(configuredHandle) ? configuredHandle : "";

/** True only when the list is explicitly connected. Pages import this to gate the block. */
export const NEWSLETTER_ENABLED = BUTTONDOWN_USER !== "";

export function NewsletterForm() {
  // No placeholder UI on prod: render nothing until the list is connected.
  if (!NEWSLETTER_ENABLED) return null;

  return (
    <section
      aria-label="Newsletter"
      className="rounded-[var(--radius-md)] border border-border bg-surface p-6"
    >
      <h2 className="text-base font-medium text-ink">New writing, occasionally.</h2>
        <p className="mt-2 max-w-[52ch] text-sm text-ink-secondary">
        The odd essay or note when I ship something worth reading — no cadence, no spam, unsubscribe
        in one click.
      </p>
      <p id="newsletter-help" className="sr-only">
        Enter your email address, then select Subscribe. Buttondown opens in a new tab to confirm your subscription.
      </p>
      <form
        action={`https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USER}`}
        method="post"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Newsletter subscription"
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
          aria-describedby="newsletter-help"
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
