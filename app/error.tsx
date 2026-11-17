"use client";

import { Button } from "@/components/ui/button";
import { ErrorStage } from "@/components/misc/error-stage";
import { SITE } from "@/config/site";

type ErrorProps = {
  /** Captured by Next when a route segment fails. */
  error: Error & { digest?: string };
  /** Attempts a remount of the failed route segment. */
  reset: () => void;
};

/**
 * Segment error boundary — the 404's family (dark stage, dotted digits), with
 * retry and email. It renders INSIDE the root layout's `<main>`, so it adds no
 * landmark of its own.
 */
export default function ErrorBoundary({ error, reset }: ErrorProps) {
  return (
    <ErrorStage
      digits="500"
      title="Something went wrong."
      lede={
        <>
          <p>This page failed to render. Try again, and if it keeps happening, tell me.</p>
          {error.digest ? (
            <p className="mt-2 font-mono text-xs text-ink-tertiary">Reference: {error.digest}</p>
          ) : null}
        </>
      }
      actions={
        <>
          <Button variant="grey" onClick={reset}>
            Try again
          </Button>
          <Button href={`mailto:${SITE.email}`} variant="ghost">
            Email {SITE.email}
          </Button>
        </>
      }
    />
  );
}
