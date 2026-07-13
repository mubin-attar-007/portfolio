"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { home } from "@/content/site";

/**
 * Faq — a Clerk-style accordion adapted to a personal-brand FAQ. One panel open
 * at a time; smooth height via a grid-rows 0fr→1fr transition (no JS measuring).
 * A11y: each question is a <button> with aria-expanded controlling its panel;
 * the panel is a region labelled by the button.
 */
export function Faq() {
  const { faq } = home;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto w-full max-w-[var(--width-prose)]">
      <p className="font-mono text-xs uppercase tracking-[0.06em] text-accent">{faq.kicker}</p>
      <h2 className="mt-4 text-3xl tracking-[-0.02em] text-ink sm:text-4xl">{faq.title}</h2>

      <ul className="mt-10 divide-y divide-border border-y border-border">
        {faq.items.map((item, i) => {
          const on = open === i;
          return (
            <li key={item.q}>
              <h3>
                <button
                  type="button"
                  onClick={() => setOpen(on ? null : i)}
                  aria-expanded={on}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-q-${i}`}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className={`text-lg transition-colors duration-200 ease-[var(--ease-out)] ${on ? "text-accent" : "text-ink"}`}>
                    {item.q}
                  </span>
                  <Plus
                    size={18}
                    strokeWidth={1.7}
                    aria-hidden
                    className={`shrink-0 text-ink-tertiary transition-[transform,color] duration-[var(--motion-fast)] ${on ? "rotate-45 text-accent" : ""}`}
                  />
                </button>
              </h3>
              <div
                id={`faq-panel-${i}`}
                role="region"
                aria-labelledby={`faq-q-${i}`}
                className="grid transition-all duration-[var(--motion-slow)]"
                style={{ gridTemplateRows: on ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <p className="max-w-[60ch] pb-5 text-ink-secondary">{item.a}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
