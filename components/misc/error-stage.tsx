import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { DarkSurface } from "@/components/layout/dark-surface";
import { DotDigits } from "./dot-digits";
import styles from "./misc.module.css";

/**
 * ErrorStage — the dark "something is missing" family (404, error, global
 * error, after the Clerk 404): giant halftone digits in a dotted frame under a
 * faint radial light, then one line of message, the actions and any way back in.
 *
 * Server-safe and hook-free, so the client error boundaries can render it.
 * A11y: the digits are decorative; `title` is the page's one `<h1>`.
 */
export function ErrorStage({
  digits,
  title,
  lede,
  actions,
  children,
}: {
  digits: string;
  title: string;
  lede?: ReactNode;
  actions: ReactNode;
  children?: ReactNode;
}) {
  return (
    <DarkSurface className={`${styles.stage} flex-1`}>
      <Container className="flex flex-col items-center pt-[clamp(2rem,5vw,4rem)] pb-[var(--space-section-md-end)] text-center">
        <div className="w-full max-w-[1030px]">
          <DotDigits text={digits} id={`stage-${digits}`} />
        </div>
        <h1 className="mt-10 max-w-[28ch] text-[clamp(1.25rem,2vw,1.5rem)] font-medium tracking-[-0.015em] text-balance text-ink">
          {title}
        </h1>
        {lede ? <div className="mt-3 max-w-[52ch] text-ink-secondary">{lede}</div> : null}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">{actions}</div>
        {children}
      </Container>
    </DarkSurface>
  );
}
