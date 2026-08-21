"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Section } from "@/components/layout/section";
import { SITE } from "@/config/site";

type ErrorState = {
  /** Captured by Next when a route group fails. */
  error: Error & { digest?: string };
  /** Attempts a remount of the failed route segment. */
  reset: () => void;
};

export default function ErrorState({ error, reset }: ErrorState) {
  // No <main> here. This boundary renders INSIDE the root layout's
  // <main id="main">, so wrapping it in another one produced two main landmarks
  // — a real a11y defect on a surface that only appears when something has
  // already gone wrong.
  return (
    <div className="min-h-[60vh]">
      <Section space="lg">
        <div className="max-w-[60ch]">
          <p className="font-mono text-xs uppercase tracking-[0.06em] text-ink-tertiary">
            Error · production hardening guard
          </p>
          <h1 className="mt-5 max-w-[18ch] text-section font-[560] text-ink">
            Something failed unexpectedly.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-secondary">
            I hit a temporary issue while rendering this page. You can retry once, and if this repeats
            please reach out so I can inspect it directly.
          </p>
          <div className="mt-8 flex flex-wrap gap-3" role="group" aria-label="Recovery actions">
            <button type="button" onClick={reset} className={buttonVariants("primary")}>
              <RefreshCw size={16} strokeWidth={1.8} aria-hidden />
              Reload this page
            </button>
            <Link href="/" className={buttonVariants("secondary")}>
              <ArrowLeft size={16} strokeWidth={1.8} aria-hidden />
              Back to home
            </Link>
          </div>
          <p className="mt-8 inline-flex gap-2 font-mono text-sm text-ink-tertiary">
            <AlertTriangle size={16} strokeWidth={1.8} aria-hidden />
            <span>Issue reference: {error.digest ?? "unknown"}</span>
          </p>
          <p className="mt-4 text-sm text-ink-secondary">
            For persistent issues, contact{" "}
            <a href={`mailto:${SITE.email}`} className="link-underline">
              {SITE.email}
            </a>
            .
          </p>
        </div>
      </Section>
    </div>
  );
}
