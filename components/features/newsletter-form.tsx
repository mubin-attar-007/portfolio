import { Button } from "@/components/ui/button";
import { ArrowOut } from "@/components/ui/caret-link";
import { cx } from "@/components/ui/cx";
import { writingPage } from "@/content/pages/writing";

/**
 * The newsletter: a sign-up at the foot of the writing index (/writing and
 * /notes), never in a hero.
 *
 * Off by default. It renders only when NEXT_PUBLIC_BUTTONDOWN_USERNAME names
 * the Buttondown account to post to — one setting, with no committed default,
 * so the form cannot reach visitors before the owner has confirmed the list
 * delivers (hidden on 2026-11-16 until that is checked). Unset, empty, or not a
 * plain handle: it renders NOTHING — no placeholder or "coming soon" UI ever
 * ships (F-01), and no empty wrapper is left behind.
 */
const configuredHandle = process.env.NEXT_PUBLIC_BUTTONDOWN_USERNAME?.trim() ?? "";

/** The account the form posts to. Only a plain handle counts, so the action URL stays a path segment. */
const BUTTONDOWN_USER = /^[A-Za-z0-9_-]+$/.test(configuredHandle) ? configuredHandle : "";

/** True only when the list is explicitly connected (/privacy reads it to describe Buttondown). */
export const NEWSLETTER_ENABLED = BUTTONDOWN_USER !== "";

/** The sign-up where a page shows it: nothing until the list is connected. */
export function NewsletterForm({ className }: { className?: string }) {
  if (!NEWSLETTER_ENABLED) return null;
  return <NewsletterSignup handle={BUTTONDOWN_USER} className={className} />;
}

/**
 * NewsletterSignup — the sign-up itself, for a connected Buttondown `handle`:
 * the pitch beside an email field and Subscribe, on the site's card. The form
 * posts to Buttondown in a new tab (the button carries the out-arrow), where the
 * reader confirms; nothing is stored here.
 *
 * A server component: the browser's native form submission is the whole
 * interaction, so no client boundary ships.
 * A11y: a section named by its heading; a labelled field (visually hidden
 * label) described by a hint that says a new tab opens; a real submit button
 * with the global focus ring.
 */
export function NewsletterSignup({ handle, className }: { handle: string; className?: string }) {
  const copy = writingPage.newsletter;
  return (
    <section
      aria-labelledby="newsletter-title"
      className={cx(
        "grid gap-6 rounded-[var(--radius-xl)] bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-center lg:gap-10",
        className,
      )}
    >
      <div>
        <h2 id="newsletter-title" className="text-title text-ink">
          {copy.title}
        </h2>
        <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-ink-secondary">{copy.body}</p>
      </div>
      <form
        action={`https://buttondown.com/api/emails/embed-subscribe/${handle}`}
        method="post"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col gap-2.5 sm:flex-row"
      >
        <label htmlFor="newsletter-email" className="sr-only">
          {copy.label}
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder={copy.placeholder}
          aria-describedby="newsletter-help"
          className="h-10 w-full min-w-0 rounded-[var(--radius-md)] bg-surface px-3.5 text-sm text-ink shadow-[inset_0_0_0_1px_var(--color-border-strong)] transition-shadow duration-fast ease-[var(--ease-out)] placeholder:text-ink-tertiary hover:shadow-[inset_0_0_0_1px_var(--color-ink-tertiary)] sm:w-auto sm:flex-1"
        />
        <Button type="submit" variant="dark" size="lg">
          {copy.submit}
          <ArrowOut />
        </Button>
        <p id="newsletter-help" className="sr-only">
          {copy.help}
        </p>
      </form>
    </section>
  );
}
