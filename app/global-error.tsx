// Global fallback for unrecoverable root-level failures.
//
// Next replaces the ENTIRE document with what this returns, so app/layout.tsx
// never runs: no stylesheet import, no fonts, no chrome. This file therefore
// imports the global stylesheet itself and renders its own <html>/<body>. The
// Geist faces cannot be recovered (next/font injects them through the layout
// that did not run), so the stack falls back to the system face by design.

"use client";

import "@/styles/globals.css";
import { buttonClassName } from "@/components/ui/button";
import { ArrowOut } from "@/components/ui/caret-link";
import { ErrorStage } from "@/components/misc/error-stage";
import { SITE } from "@/config/site";

type GlobalErrorProps = {
  /** Captured by Next for the segment where recovery first fails. */
  error: Error & { digest?: string };
  /** Attempt a full application remount from the error boundary root. */
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en" data-theme="light">
      <body className="flex min-h-screen flex-col">
        <main id="main" className="flex flex-1 flex-col">
          <ErrorStage
            digits="500"
            title="Something went wrong."
            lede={
              <>
                <p>The site failed to load. Try again, and if it keeps happening, tell me.</p>
                {error.digest ? (
                  <p className="mt-2 font-mono text-xs text-ink-tertiary">Reference: {error.digest}</p>
                ) : null}
              </>
            }
            actions={
              <>
                <button type="button" onClick={reset} className={buttonClassName("grey")}>
                  Try again
                </button>
                {/* Plain anchors, not next/link: the client router is part of
                    what failed, so recovery has to be a real navigation. */}
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a href="/" className={buttonClassName("ghost")}>
                  Go to homepage
                </a>
                <a href={`mailto:${SITE.email}`} className={buttonClassName("ghost")}>
                  Email {SITE.email}
                  <ArrowOut />
                </a>
              </>
            }
          />
        </main>
      </body>
    </html>
  );
}
