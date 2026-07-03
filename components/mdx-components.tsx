/**
 * Design-language component map for compiled case-study MDX bodies.
 *
 * Every intrinsic element the MDX emits (h2/h3, p, ul/ol/li, code, pre,
 * blockquote, a, strong, hr, table) is mapped to a styled component that
 * matches the LOCKED "Live Systems" language: Fraunces headings, Geist-Mono
 * inline code + eyebrows, teal accents, depth on surfaces. Headings get
 * slugged ids so the case-study TOC can deep-link to them.
 *
 * Server-safe (no hooks / no "use client") so it can be passed to
 * next-mdx-remote/rsc's compileMDX in a Server Component.
 */

import type { ComponentPropsWithoutRef, ReactNode } from "react";

/** Stable slug from a heading's text (used for TOC anchors). */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Flatten React children to a plain string (for heading ids). */
function toText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toText).join("");
  if (typeof node === "object" && "props" in node) {
    return toText((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

function H2({ children, ...props }: ComponentPropsWithoutRef<"h2">) {
  const id = slugify(toText(children));
  return (
    <h2
      id={id}
      className="cs-h2 group scroll-mt-28 font-display text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]"
      {...props}
    >
      {children}
    </h2>
  );
}

function H3({ children, ...props }: ComponentPropsWithoutRef<"h3">) {
  const id = slugify(toText(children));
  return (
    <h3
      id={id}
      className="mt-8 scroll-mt-28 font-display text-lg font-semibold tracking-tight text-ink sm:text-xl"
      {...props}
    >
      {children}
    </h3>
  );
}

function P(props: ComponentPropsWithoutRef<"p">) {
  return <p className="mt-4 text-[15.5px] leading-[1.75] text-muted" {...props} />;
}

function UL(props: ComponentPropsWithoutRef<"ul">) {
  return <ul className="cs-ul mt-4 space-y-2.5" {...props} />;
}

function OL(props: ComponentPropsWithoutRef<"ol">) {
  return <ol className="cs-ol mt-4 space-y-2.5" {...props} />;
}

function LI(props: ComponentPropsWithoutRef<"li">) {
  return <li className="text-[15.5px] leading-[1.7] text-muted" {...props} />;
}

function Strong(props: ComponentPropsWithoutRef<"strong">) {
  return <strong className="font-semibold text-ink" {...props} />;
}

function Em(props: ComponentPropsWithoutRef<"em">) {
  return <em className="text-ink/90" {...props} />;
}

function A({ href = "", children, ...props }: ComponentPropsWithoutRef<"a">) {
  const external = /^https?:\/\//.test(href);
  return (
    <a
      href={href}
      className="cs-link font-medium text-accent underline decoration-accent/30 underline-offset-2 transition hover:decoration-accent"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    >
      {children}
    </a>
  );
}

/** Inline code — mono chip. `pre > code` is handled by Pre below. */
function Code(props: ComponentPropsWithoutRef<"code">) {
  return <code className="cs-code" {...props} />;
}

/**
 * Fenced code block. In the case studies these are ASCII architecture
 * schematics, so they get the instrument "well" treatment: a deep panel with a
 * luminous top rail, horizontal scroll, mono. A small kicker labels it.
 */
function Pre({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
  return (
    <div className="cs-pre-wrap not-prose my-6">
      <span className="cs-pre-kicker" aria-hidden>
        schematic
      </span>
      <pre className="cs-pre" {...props}>
        {children}
      </pre>
    </div>
  );
}

/** Blockquote → a teal-edged callout. */
function Blockquote(props: ComponentPropsWithoutRef<"blockquote">) {
  return <blockquote className="cs-callout not-prose my-6" {...props} />;
}

function HR() {
  return <div className="hairline my-10" role="separator" />;
}

function Table(props: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="cs-table-wrap not-prose my-6 overflow-x-auto">
      <table className="cs-table" {...props} />
    </div>
  );
}

export const mdxComponents = {
  h2: H2,
  h3: H3,
  p: P,
  ul: UL,
  ol: OL,
  li: LI,
  strong: Strong,
  em: Em,
  a: A,
  code: Code,
  pre: Pre,
  blockquote: Blockquote,
  hr: HR,
  table: Table,
};
