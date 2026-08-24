// Global fallback for unrecoverable root-level failures.
//
// This catches render errors that occur before a segment-level `error.tsx`
// boundary can mount (e.g. a layout bootstrap failure). Next replaces the ENTIRE
// document with what this returns, which means `app/layout.tsx` never runs: no
// font variables, no `data-theme`, no pre-paint script.
//
// That is why the <html> below carries `data-theme="dark"` and the same inline
// theme script the root layout uses. Without them the failure state rendered
// theme-less and in a system font — the one screen a visitor sees when something
// has gone badly wrong was the only screen that looked like a different site.
//
// The fonts themselves cannot be recovered here (next/font injects its CSS
// through the layout that did not run), so the stack falls back to the system
// UI face deliberately rather than pretending otherwise.

"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { SITE } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";

type GlobalErrorProps = {
  /** Captured by Next for the segment where recovery first fails. */
  error: Error & { digest?: string };
  /** Attempt a full application remount from the error boundary root. */
  reset: () => void;
};

/** Mirrors app/layout.tsx: light is the brand, dark is a remembered choice. */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');}catch(e){}})();`;

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-bg font-sans text-ink antialiased">
        <main className="mx-auto flex min-h-screen w-full max-w-[var(--width-container)] items-center px-5 py-16 sm:px-6 md:px-8">
          <div className="max-w-[60ch]">
            <p className="font-mono text-xs uppercase tracking-[0.07em] text-ink-tertiary">
              Global runtime error
            </p>
            <h1 className="mt-5 max-w-[18ch] text-section font-bold text-ink">
              We hit a hard runtime boundary.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-secondary">
              This is an infrastructure-level issue loading the application shell. Retry once; if it
              persists, please get in touch so I can inspect it directly.
            </p>
            <div className="mt-8 flex flex-wrap gap-3" role="group" aria-label="Recovery actions">
              <button type="button" onClick={reset} className={buttonVariants("primary", "lg")}>
                <RefreshCw size={16} strokeWidth={2} aria-hidden />
                Retry the app
              </button>
              {/* A plain anchor, not next/link. This boundary replaces the whole
                  document, so the client router is part of what has already
                  failed; recovery has to be a real navigation. The lint rule
                  that prefers <Link> assumes a working router. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" className={buttonVariants("secondary", "lg")}>
                Back to home
              </a>
            </div>
            <p className="mt-8 inline-flex items-center gap-2 font-mono text-sm text-ink-tertiary">
              <AlertTriangle size={16} strokeWidth={2} aria-hidden />
              Issue reference: {error.digest ?? "unknown"}
            </p>
            <p className="mt-4 text-sm text-ink-secondary">
              Contact{" "}
              <a href={`mailto:${SITE.email}`} className="link-underline text-ink">
                {SITE.email}
              </a>
              .
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
