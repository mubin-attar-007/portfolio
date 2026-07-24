// Global fallback for unrecoverable root-level failures.
//
// This catches render errors that occur before a segment-level `error.tsx`
// boundary can mount (e.g. layout bootstrap issues). It keeps production
// behavior consistent with the route-level hardening boundary.

"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";

import { SITE } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";

type GlobalErrorProps = {
  /** Captured by Next for the segment where recovery first fails. */
  error: Error & { digest?: string };
  /** Attempt a full application remount from the error boundary root. */
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg">
        <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-16">
          <section className="space-y-6">
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-ink-tertiary">
              Global runtime error
            </p>
            <h1 className="max-w-[18ch] text-4xl font-[560] leading-tight text-ink sm:text-5xl">
              We hit a hard runtime boundary.
            </h1>
            <p className="max-w-[65ch] text-lg leading-relaxed text-ink-secondary">
              This is an infrastructure-level issue loading the application shell.
              Retry once; if it persists, please contact {SITE.email}.
            </p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={reset} className={buttonVariants("primary")}>
                <RefreshCw size={16} strokeWidth={1.8} aria-hidden />
                Retry entire app
              </button>
              <Link href="/" className={buttonVariants("secondary")}>
                Back to home
              </Link>
            </div>
            <p className="font-mono text-sm text-ink-tertiary">Issue reference: {error.digest ?? "unknown"}</p>
          </section>
        </main>
      </body>
    </html>
  );
}
