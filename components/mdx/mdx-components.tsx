import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Callout } from "@/components/ui/callout";
import { PullQuote } from "@/components/ui/pull-quote";
import { CodeBlock } from "@/components/ui/code-block";
import { Figure } from "@/components/ui/figure";
import { DecisionLog } from "@/components/mdx/decision-log";
import { FailureLog } from "@/components/mdx/failure-log";
import { PROSE } from "@/components/mdx/prose";

/**
 * MDX component map — plain markdown elements bound to the shared reading scale
 * (components/mdx/prose.ts), plus the custom evidence blocks available inside
 * content. Server-safe (no client hooks), so an MDX body ships zero client JS.
 *
 * Every class string here comes from PROSE rather than being typed inline. That
 * is deliberate: the case-study path (`components/case-studies/section.tsx`)
 * renders the same semantic elements through different code, and the two only
 * stay identical if neither owns its own values.
 *
 * A11y: headings get slugged ids so they can be deep-linked and so a future
 * table of contents has real targets; PROSE.h2/h3 carry the scroll margin that
 * keeps a jumped-to heading clear of the sticky header. Links are underlined at
 * rest, never distinguished by colour alone (WCAG 1.4.1). External links are
 * marked `rel="noopener noreferrer"`.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function toText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return toText((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

function H2({ children, ...props }: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2 id={slugify(toText(children))} className={PROSE.h2} {...props}>
      {children}
    </h2>
  );
}
function H3({ children, ...props }: ComponentPropsWithoutRef<"h3">) {
  return (
    <h3 id={slugify(toText(children))} className={PROSE.h3} {...props}>
      {children}
    </h3>
  );
}

export const mdxComponents = {
  h2: H2,
  h3: H3,
  p: (p: ComponentPropsWithoutRef<"p">) => <p className={PROSE.p} {...p} />,
  ul: (p: ComponentPropsWithoutRef<"ul">) => <ul className={PROSE.ul} {...p} />,
  ol: (p: ComponentPropsWithoutRef<"ol">) => <ol className={PROSE.ol} {...p} />,
  li: (p: ComponentPropsWithoutRef<"li">) => <li className={PROSE.li} {...p} />,
  a: ({ href = "", ...p }: ComponentPropsWithoutRef<"a">) => (
    <a
      href={href}
      className={PROSE.link}
      {...(/^https?:\/\//.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...p}
    />
  ),
  strong: (p: ComponentPropsWithoutRef<"strong">) => <strong className={PROSE.strong} {...p} />,
  em: (p: ComponentPropsWithoutRef<"em">) => <em {...p} />,
  hr: () => <hr className={PROSE.hr} />,
  blockquote: (p: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className={PROSE.blockquote} {...p} />
  ),
  code: (p: ComponentPropsWithoutRef<"code">) => <code className={PROSE.code} {...p} />,
  // custom blocks usable directly in MDX
  Callout,
  PullQuote,
  CodeBlock,
  Figure,
  DecisionLog,
  FailureLog,
};
